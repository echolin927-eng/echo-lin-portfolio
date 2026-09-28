#!/usr/bin/env python3
"""Self-hosted portfolio CMS API for echolin.com.cn."""

import base64
import cgi
import hashlib
import hmac
import json
import os
import re
import secrets
import shutil
import sqlite3
import time
import uuid
from datetime import datetime, timezone
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse

HOST = os.environ.get("PORTFOLIO_HOST", "127.0.0.1")
PORT = int(os.environ.get("PORTFOLIO_PORT", "8787"))
DATA_DIR = Path(os.environ.get("PORTFOLIO_DATA_DIR", "/var/lib/echo-portfolio"))
CONFIG_PATH = Path(os.environ.get("PORTFOLIO_CONFIG", "/etc/echo-portfolio/config.json"))
DB_PATH = DATA_DIR / "portfolio.db"
MEDIA_DIR = DATA_DIR / "media"
TRASH_DIR = DATA_DIR / "trash"
ASSET_ROOT = Path(os.environ.get("PORTFOLIO_ASSET_ROOT", "/www/wwwroot/echolin.com.cn/assets"))
COOKIE_NAME = "portfolio_admin"
SESSION_AGE = 43200
MAX_BODY = 260 * 1024 * 1024
MAX_FILE = 25 * 1024 * 1024
MAX_FILES = 10
CATEGORIES = {"vi-design", "amazon-store-design", "detail-page-design", "commercial-design", "website-design"}
LOGIN_FAILURES = {}

def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

def load_config():
    with CONFIG_PATH.open("r", encoding="utf-8") as handle:
        config = json.load(handle)
    if not config.get("session_secret") or not (config.get("password_hash") or config.get("setup_token")):
        raise RuntimeError("portfolio config is incomplete")
    return config

CONFIG = load_config()

def password_hash(password):
    salt = os.urandom(16)
    iterations = 210000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return "pbkdf2_sha256$%s$%s$%s" % (iterations, base64.b64encode(salt).decode(), base64.b64encode(digest).decode())

def verify_password(password):
    try:
        algorithm, iterations, salt, expected = CONFIG["password_hash"].split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), base64.b64decode(salt), int(iterations))
        return hmac.compare_digest(actual, base64.b64decode(expected))
    except (KeyError, ValueError, TypeError):
        return False

def init_storage():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    TRASH_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(str(DB_PATH)) as db:
        db.executescript("""
        PRAGMA journal_mode=WAL;
        PRAGMA foreign_keys=ON;
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY, title TEXT NOT NULL, english TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL,
          published INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
        );
        CREATE TABLE IF NOT EXISTS images (
          id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          file_key TEXT NOT NULL UNIQUE, alt TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL, deleted_at TEXT
        );
        CREATE INDEX IF NOT EXISTS projects_category_idx ON projects(category,published,sort_order,deleted_at);
        CREATE INDEX IF NOT EXISTS images_project_idx ON images(project_id,sort_order,deleted_at);
        CREATE TABLE IF NOT EXISTS site_assets (
          path TEXT PRIMARY KEY, replacement_key TEXT, hidden INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
        """)

def connect():
    db = sqlite3.connect(str(DB_PATH), timeout=15)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    return db

def clean_project(payload):
    try:
        order = int(payload.get("sort_order") or 0)
    except (TypeError, ValueError):
        order = 0
    return {
        "title": str(payload.get("title", "")).strip()[:120],
        "english": str(payload.get("english", "")).strip()[:120],
        "description": str(payload.get("description", "")).strip()[:1200],
        "category": str(payload.get("category", "")).strip()[:80],
        "published": 0 if payload.get("published") is False else 1,
        "sort_order": order,
    }

def image_kind(head):
    if head.startswith(b"\xff\xd8\xff"): return "jpg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"): return "png"
    if head.startswith((b"GIF87a", b"GIF89a")): return "gif"
    if head.startswith(b"RIFF") and head[8:12] == b"WEBP": return "webp"
    if len(head) > 12 and head[4:12] in (b"ftypavif", b"ftypavis"): return "avif"
    if len(head) > 12 and head[4:8] == b"ftyp": return "mp4"
    return None

HOME_ASSETS = {
    "/assets/echo-girl.png", "/assets/echo-girl-reveal.png", "/assets/echo-portrait.jpg",
    "/assets/work-showcase-01-new.png", "/assets/work-showcase-02-new.png", "/assets/work-showcase-01.jpg",
    "/assets/work-showcase-04.jpg", "/assets/work-showcase-05.jpg", "/assets/design-cover-amazon-store.jpg",
    "/assets/design-cover-commercial.jpg", "/assets/design-cover-detail-page.jpg", "/assets/design-cover-website.jpg",
    "/assets/motion-reel-01.mp4", "/assets/motion-reel-02.mp4", "/assets/motion-reel-03.mp4",
    "/assets/amazon-ai-prompts.mp4", "/assets/motion-reel-01-poster.jpg", "/assets/motion-reel-02-poster.jpg",
    "/assets/motion-reel-03-poster.jpg", "/assets/amazon-ai-prompts-cover.png",
    "/assets/detail-work-08-main-01.png", "/assets/detail-work-08-main-02.jpg", "/assets/detail-work-08-main-03.jpg",
    "/assets/detail-work-08-main-04.jpg", "/assets/detail-work-01-main-01.jpg", "/assets/detail-work-01-main-02.jpg",
    "/assets/detail-work-01-main-03.jpg", "/assets/detail-work-01-main-04.jpg"
}

GROUP_LABELS = {"home":"首页图片", "vi-design":"VI 设计", "amazon-store-design":"亚马逊店铺",
                "detail-page-design":"详情页设计", "commercial-design":"商业设计",
                "website-design":"网站设计", "video-work":"视频作品", "other":"其他素材"}

def asset_work(path, group):
    lower = path.lower(); name = Path(path).name
    if group == "home":
        if name in {"echo-girl.png", "echo-girl-reveal.png"}: return "01 · 首页首屏视觉"
        if lower.endswith(".mp4") or "poster" in lower or "amazon-ai-prompts-cover" in lower: return "03 · 首页视频"
        if "detail-work" in lower: return "04 · 首页作品图片"
        return "02 · 个人介绍与案例卡片"
    if group == "vi-design":
        if "/sillroot/" in lower: return "01 · SILLROOT"
        if "/vi-design/vi-design-" in lower: return "02 · TFIT"
        return "00 · 类目封面"
    if group == "amazon-store-design":
        return "01 · 亚马逊旗舰店设计" if "amazon-store-" in lower else "00 · 类目封面"
    if group == "detail-page-design":
        match = re.search(r"detail-(?:work|preview)-(\d{2})", lower)
        return (match.group(1) + " · 详情页作品 " + match.group(1)) if match else "00 · 类目封面"
    if group == "commercial-design":
        if "/commercial-social/" in lower: return "01 · 社媒图片"
        if "/commercial-posters/" in lower: return "02 · 海报图片"
        if "/commercial-packaging/" in lower: return "03 · 包装设计"
        if "/commercial-exhibition/" in lower: return "04 · 展会设计"
        return "00 · 类目封面"
    if group == "website-design": return "01 · 网站设计" if "website-design-" in lower else "00 · 类目封面"
    if group == "video-work":
        match = re.search(r"(?:motion-reel|reel-cover)-(\d{2})", lower)
        if match: return match.group(1) + " · 视频作品 " + match.group(1)
        if "amazon-ai-prompts" in lower: return "05 · AI 创意视频"
        if "storyboard" in lower: return "06 · 视频分镜"
        return "其他视频素材"
    return "其他素材"

def asset_groups(path):
    lower = path.lower(); groups = []
    if path in HOME_ASSETS: groups.append("home")
    if "/vi-design/" in lower: groups.append("vi-design")
    if "amazon-store" in lower: groups.append("amazon-store-design")
    if "detail" in lower or "aebar" in lower or "fountain" in lower: groups.append("detail-page-design")
    if "commercial" in lower: groups.append("commercial-design")
    if "website" in lower or "web-page" in lower: groups.append("website-design")
    if lower.endswith(".mp4") or "video" in lower or "motion" in lower or "reel" in lower: groups.append("video-work")
    return groups or ["other"]

def asset_catalog(db):
    overrides = {row["path"]: row for row in db.execute("SELECT * FROM site_assets").fetchall()}
    paths = set(overrides)
    if ASSET_ROOT.is_dir():
        for file_path in ASSET_ROOT.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".mp4"}:
                paths.add("/assets/" + file_path.relative_to(ASSET_ROOT).as_posix())
    return [{"path": item, "label": Path(item).name, "groups": asset_groups(item),
             "group": " / ".join(GROUP_LABELS[group] for group in asset_groups(item)), "works": {group: asset_work(item, group) for group in asset_groups(item)},
             "type": "video" if item.lower().endswith(".mp4") else "image", "original_url": item,
             "url": "/portfolio-media/" + quote(overrides[item]["replacement_key"]) if item in overrides and overrides[item]["replacement_key"] else item,
             "replaced": bool(item in overrides and overrides[item]["replacement_key"]), "hidden": bool(overrides[item]["hidden"]) if item in overrides else False}
            for item in sorted(paths, key=lambda value: (asset_groups(value), value))]

def project_rows(db, category=None, include_drafts=False, deleted=False):
    conditions = ["deleted_at IS NOT NULL" if deleted else "deleted_at IS NULL"]
    values = []
    if not include_drafts: conditions.append("published=1")
    if category:
        conditions.append("category=?")
        values.append(category)
    projects = db.execute("SELECT * FROM projects WHERE " + " AND ".join(conditions) + " ORDER BY sort_order,created_at DESC", values).fetchall()
    if not projects: return []
    placeholders = ",".join("?" for _ in projects)
    images = db.execute("SELECT id,project_id,file_key,alt,sort_order,deleted_at FROM images WHERE project_id IN (" + placeholders + ") ORDER BY sort_order,created_at", [row["id"] for row in projects]).fetchall()
    result = []
    for row in projects:
        project = dict(row)
        project["published"] = bool(project["published"])
        project["images"] = [{**dict(image), "url": "/portfolio-media/" + quote(image["file_key"])} for image in images if image["project_id"] == project["id"] and not image["deleted_at"]]
        result.append(project)
    return result

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class Handler(BaseHTTPRequestHandler):
    server_version = "EchoPortfolio/1.0"

    def json(self, payload, status=200, headers=None):
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        for key, value in (headers or {}).items(): self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def fail(self, message, status=400): self.json({"error": message}, status)

    def body_json(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length > 1024 * 1024: raise ValueError("请求内容过大。")
        return json.loads(self.rfile.read(length).decode() or "{}")

    def parts(self):
        path = urlparse(self.path).path
        return [unquote(item) for item in path[len("/api/portfolio"):].strip("/").split("/") if item]

    def cookie(self):
        cookie = SimpleCookie(); cookie.load(self.headers.get("Cookie", ""))
        return cookie[COOKIE_NAME].value if COOKIE_NAME in cookie else ""

    def authenticated(self):
        try:
            expiry, nonce, signature = self.cookie().split(".", 2)
            if int(expiry) < int(time.time()): return False
            expected = hmac.new(CONFIG["session_secret"].encode(), (expiry + "." + nonce).encode(), hashlib.sha256).hexdigest()
            return hmac.compare_digest(signature, expected)
        except (ValueError, TypeError): return False

    def require_admin(self):
        if self.authenticated(): return True
        self.fail("登录已失效，请重新登录。", 401); return False

    def safe_origin(self):
        origin = self.headers.get("Origin")
        return not origin or origin == CONFIG.get("allowed_origin", "https://echolin.com.cn")

    def do_GET(self):
        parsed, parts = urlparse(self.path), self.parts()
        if parsed.path == "/api/portfolio/health": self.json({"ok": True}); return
        with connect() as db:
            if parts == ["status"]:
                self.json({"configured": bool(CONFIG.get("password_hash"))}); return
            if parts == ["content"]:
                rows = db.execute("SELECT path,replacement_key,hidden FROM site_assets WHERE replacement_key IS NOT NULL OR hidden=1").fetchall()
                self.json({"assets": {row["path"]: {"url": "/portfolio-media/" + quote(row["replacement_key"]) if row["replacement_key"] else None, "hidden": bool(row["hidden"])} for row in rows}}); return
            if not parts:
                category = parse_qs(parsed.query).get("category", [None])[0]
                self.json({"projects": project_rows(db, category)}); return
            if parts == ["admin", "projects"]:
                if self.require_admin(): self.json({"projects": project_rows(db, include_drafts=True)})
                return
            if parts == ["admin", "trash"]:
                if self.require_admin(): self.json({"projects": project_rows(db, include_drafts=True, deleted=True)})
                return
            if parts == ["admin", "assets"]:
                if self.require_admin(): self.json({"assets": asset_catalog(db)})
                return
        self.fail("接口不存在。", 404)

    def do_POST(self):
        if not self.safe_origin(): self.fail("请求来源无效。", 403); return
        parts = self.parts()
        if parts == ["setup"]: self.configure_admin(); return
        if parts == ["login"]: self.login(); return
        if parts == ["logout"]:
            self.json({"ok": True}, headers={"Set-Cookie": COOKIE_NAME + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"}); return
        if not self.require_admin(): return
        with connect() as db:
            if parts == ["admin", "assets", "replace"]: self.replace_asset(db); return
            if parts == ["admin", "assets", "visibility"]: self.asset_visibility(db); return
            if parts == ["admin", "assets", "reset"]: self.reset_asset(db); return
            if parts == ["admin", "projects"]:
                item = clean_project(self.body_json())
                if not item["title"] or item["category"] not in CATEGORIES: self.fail("作品名称或分类无效。"); return
                project_id, stamp = str(uuid.uuid4()), now_iso()
                db.execute("INSERT INTO projects(id,title,english,description,category,published,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", (project_id,item["title"],item["english"],item["description"],item["category"],item["published"],item["sort_order"],stamp,stamp))
                db.commit(); self.json({"id": project_id}, 201); return
            if len(parts) == 4 and parts[:2] == ["admin", "projects"] and parts[3] == "images": self.upload(db, parts[2]); return
            if len(parts) == 4 and parts[:2] == ["admin", "projects"] and parts[3] == "restore":
                db.execute("UPDATE projects SET deleted_at=NULL,updated_at=? WHERE id=?", (now_iso(),parts[2])); db.execute("UPDATE images SET deleted_at=NULL WHERE project_id=?", (parts[2],)); db.commit(); self.json({"ok": True}); return
        self.fail("接口不存在。", 404)

    def do_PUT(self):
        if not self.safe_origin(): self.fail("请求来源无效。", 403); return
        if not self.require_admin(): return
        parts = self.parts()
        with connect() as db:
            if len(parts) == 3 and parts[:2] == ["admin", "projects"]:
                item = clean_project(self.body_json())
                if not item["title"] or item["category"] not in CATEGORIES: self.fail("作品名称或分类无效。"); return
                cursor = db.execute("UPDATE projects SET title=?,english=?,description=?,category=?,published=?,sort_order=?,updated_at=? WHERE id=? AND deleted_at IS NULL", (item["title"],item["english"],item["description"],item["category"],item["published"],item["sort_order"],now_iso(),parts[2]))
                db.commit(); self.json({"ok": True}) if cursor.rowcount else self.fail("作品不存在。",404); return
            if len(parts) == 4 and parts[:2] == ["admin", "projects"] and parts[3] == "images":
                ids = self.body_json().get("imageIds", [])
                if not isinstance(ids,list) or len(ids)>200: self.fail("图片顺序无效。"); return
                for index,image_id in enumerate(ids): db.execute("UPDATE images SET sort_order=? WHERE id=? AND project_id=? AND deleted_at IS NULL",(index,str(image_id),parts[2]))
                db.commit(); self.json({"ok": True}); return
        self.fail("接口不存在。", 404)

    def do_DELETE(self):
        if not self.safe_origin(): self.fail("请求来源无效。", 403); return
        if not self.require_admin(): return
        parts = self.parts()
        with connect() as db:
            if len(parts)==3 and parts[:2]==["admin","projects"]:
                stamp=now_iso(); db.execute("UPDATE projects SET deleted_at=?,published=0,updated_at=? WHERE id=? AND deleted_at IS NULL",(stamp,stamp,parts[2])); db.execute("UPDATE images SET deleted_at=? WHERE project_id=? AND deleted_at IS NULL",(stamp,parts[2])); db.commit(); self.json({"ok":True}); return
            if len(parts)==4 and parts[:2]==["admin","projects"] and parts[3]=="purge":
                for row in db.execute("SELECT file_key FROM images WHERE project_id=?",(parts[2],)).fetchall():
                    path=MEDIA_DIR/row["file_key"]
                    if path.is_file(): path.unlink()
                shutil.rmtree(MEDIA_DIR/parts[2],ignore_errors=True); db.execute("DELETE FROM projects WHERE id=? AND deleted_at IS NOT NULL",(parts[2],)); db.commit(); self.json({"ok":True}); return
            if len(parts)==3 and parts[:2]==["admin","images"]:
                db.execute("UPDATE images SET deleted_at=? WHERE id=? AND deleted_at IS NULL",(now_iso(),parts[2])); db.commit(); self.json({"ok":True}); return
        self.fail("接口不存在。",404)

    def valid_asset(self, db, path):
        return any(item["path"] == path for item in asset_catalog(db))

    def replace_asset(self, db):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0 or length > MAX_FILE + 1024 * 1024: self.fail("上传内容为空或超过 25MB。", 413); return
        form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={"REQUEST_METHOD":"POST", "CONTENT_TYPE":self.headers.get("Content-Type", ""), "CONTENT_LENGTH":str(length)})
        asset_path = str(form.getfirst("path", "")); item = form["image"] if "image" in form else None
        if not self.valid_asset(db, asset_path) or item is None or not getattr(item, "filename", None): self.fail("请选择有效的站点图片。"); return
        head = item.file.read(16); extension = image_kind(head)
        if not extension: self.fail("仅支持 JPG、PNG、WebP、GIF、AVIF 图片或 MP4 视频。"); return
        folder = MEDIA_DIR / "site-assets"; folder.mkdir(parents=True, exist_ok=True)
        file_key = "site-assets/" + str(uuid.uuid4()) + "." + extension; output_path = MEDIA_DIR / file_key; size = len(head)
        try:
            with output_path.open("wb") as output:
                output.write(head)
                while True:
                    chunk = item.file.read(1024 * 1024)
                    if not chunk: break
                    size += len(chunk)
                    if size > MAX_FILE: raise ValueError("图片超过 25MB。")
                    output.write(chunk)
            old = db.execute("SELECT replacement_key FROM site_assets WHERE path=?", (asset_path,)).fetchone()
            db.execute("INSERT OR REPLACE INTO site_assets(path,replacement_key,hidden,updated_at) VALUES(?,?,0,?)", (asset_path,file_key,now_iso())); db.commit()
            if old and old["replacement_key"]:
                previous = MEDIA_DIR / old["replacement_key"]
                if previous.is_file(): previous.unlink()
            self.json({"ok": True}, 201)
        except Exception as exc:
            if output_path.exists(): output_path.unlink()
            self.fail(str(exc))

    def asset_visibility(self, db):
        payload = self.body_json(); asset_path = str(payload.get("path", "")); hidden = 1 if payload.get("hidden") else 0
        if not self.valid_asset(db, asset_path): self.fail("站点图片不存在。", 404); return
        old = db.execute("SELECT replacement_key FROM site_assets WHERE path=?", (asset_path,)).fetchone(); replacement = old["replacement_key"] if old else None
        db.execute("INSERT OR REPLACE INTO site_assets(path,replacement_key,hidden,updated_at) VALUES(?,?,?,?)", (asset_path,replacement,hidden,now_iso())); db.commit(); self.json({"ok": True})

    def reset_asset(self, db):
        asset_path = str(self.body_json().get("path", "")); row = db.execute("SELECT replacement_key FROM site_assets WHERE path=?", (asset_path,)).fetchone()
        if row and row["replacement_key"]:
            previous = MEDIA_DIR / row["replacement_key"]
            if previous.is_file(): previous.unlink()
        db.execute("DELETE FROM site_assets WHERE path=?", (asset_path,)); db.commit(); self.json({"ok": True})

    def configure_admin(self):
        if CONFIG.get("password_hash"):
            self.fail("后台已经完成设置。", 409); return
        payload = self.body_json(); token = str(payload.get("token", "")); password = str(payload.get("password", ""))
        if not token or not hmac.compare_digest(token, str(CONFIG.get("setup_token", ""))):
            self.fail("一次性设置码不正确。", 401); return
        if len(password) < 12:
            self.fail("管理密码至少需要 12 位。", 400); return
        updated = dict(CONFIG); updated["password_hash"] = password_hash(password); updated.pop("setup_token", None)
        temp = CONFIG_PATH.with_suffix(".tmp")
        with temp.open("w", encoding="utf-8") as handle: json.dump(updated, handle, ensure_ascii=False, indent=2)
        os.chmod(str(temp), 0o640); os.replace(str(temp), str(CONFIG_PATH)); CONFIG.clear(); CONFIG.update(updated)
        self.json({"ok": True}, 201)

    def login(self):
        client=self.headers.get("X-Forwarded-For",self.client_address[0]).split(",")[0].strip()
        failures=[stamp for stamp in LOGIN_FAILURES.get(client,[]) if time.time()-stamp<900]; LOGIN_FAILURES[client]=failures
        if len(failures)>=8: self.fail("登录尝试过多，请 15 分钟后再试。",429); return
        if not verify_password(str(self.body_json().get("password",""))): failures.append(time.time()); self.fail("密码不正确。",401); return
        LOGIN_FAILURES.pop(client,None); expiry=str(int(time.time())+SESSION_AGE); nonce=secrets.token_hex(16); signature=hmac.new(CONFIG["session_secret"].encode(),(expiry+"."+nonce).encode(),hashlib.sha256).hexdigest(); token=expiry+"."+nonce+"."+signature
        self.json({"ok":True},headers={"Set-Cookie":COOKIE_NAME+"="+token+"; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age="+str(SESSION_AGE)})

    def upload(self, db, project_id):
        length=int(self.headers.get("Content-Length","0") or 0)
        if length<=0 or length>MAX_BODY: self.fail("上传内容为空或超过 260MB。",413); return
        if not db.execute("SELECT 1 FROM projects WHERE id=? AND deleted_at IS NULL",(project_id,)).fetchone(): self.fail("作品不存在。",404); return
        form=cgi.FieldStorage(fp=self.rfile,headers=self.headers,environ={"REQUEST_METHOD":"POST","CONTENT_TYPE":self.headers.get("Content-Type", ""),"CONTENT_LENGTH":str(length)})
        field=form["images"] if "images" in form else []; files=field if isinstance(field,list) else [field]; files=[item for item in files if getattr(item,"filename",None)]
        if not files or len(files)>MAX_FILES: self.fail("每次请选择 1 至 10 张图片。"); return
        max_order=db.execute("SELECT COALESCE(MAX(sort_order),-1) FROM images WHERE project_id=? AND deleted_at IS NULL",(project_id,)).fetchone()[0]
        (MEDIA_DIR/project_id).mkdir(parents=True,exist_ok=True); created=[]
        try:
            for index,item in enumerate(files):
                head=item.file.read(16); extension=image_kind(head)
                if not extension: raise ValueError(item.filename+" 不是支持的图片格式。")
                image_id=str(uuid.uuid4()); file_key=project_id+"/"+image_id+"."+extension; output_path=MEDIA_DIR/file_key; size=len(head)
                with output_path.open("wb") as output:
                    output.write(head)
                    while True:
                        chunk=item.file.read(1024*1024)
                        if not chunk: break
                        size+=len(chunk)
                        if size>MAX_FILE: raise ValueError(item.filename+" 超过 25MB。")
                        output.write(chunk)
                created.append(output_path); db.execute("INSERT INTO images(id,project_id,file_key,alt,sort_order,created_at) VALUES(?,?,?,?,?,?)",(image_id,project_id,file_key,os.path.basename(item.filename)[:200],int(max_order)+index+1,now_iso()))
            db.commit()
        except Exception as exc:
            db.rollback()
            for path in created:
                if path.exists(): path.unlink()
            self.fail(str(exc)); return
        self.json({"ok":True,"count":len(created)},201)

if __name__ == "__main__":
    init_storage()
    server=ThreadingHTTPServer((HOST,PORT),Handler)
    print("portfolio api listening on http://%s:%s"%(HOST,PORT),flush=True)
    server.serve_forever()
