# -*- coding: utf-8 -*-
"""
ساخت صفحات دو زبانه (fa / en) از یک مجموعه قالب و ترجمه‌های مرکزی.

اجرا:   python3 make_i18n.py && python3 build.py

- قالب‌ها در src/pages، src/partials و src/layouts هستند.
- متن‌ها از i18n/fa.json و i18n/en.json خوانده می‌شوند.
- خروجی: fa/…  en/…  index.html (انتخاب زبان)  404.html  i18n/*.js
- تمام آدرس‌ها نسبی‌اند؛ پس روی GitHub Pages (زیرمسیر /BehnamPortfolio/) درست کار می‌کنند.
"""
import json, re, pathlib, datetime, os

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
SITE_URL = "https://behnamninja20-dev.github.io/BehnamPortfolio/"
YEAR = datetime.date.today().year
LOGOS = json.loads((SRC / "logos.json").read_text(encoding="utf-8"))

# (کلید، قالب، مسیر زیر پوشه زبان، چیدمان، کلید عنوان، کلید توضیح)
PAGES = [
    ("home", "home.html", "", "site", None, "home.desc"),
    ("auth", "auth.html", "auth", "auth", "auth.pageTitle", None),
    ("dashboard", "dash-overview.html", "dashboard", "dash", "dash.title", None),
    ("projects", "dash-projects.html", "dashboard/projects", "dash", "proj.listTitle", None),
    ("project-new", "dash-new.html", "dashboard/projects/new", "dash", "form.title", None),
    ("consults", "dash-consults.html", "dashboard/consultations", "dash", "cons.listTitle", None),
    ("settings", "dash-settings.html", "dashboard/settings", "dash", "set.title", None),
    ("privacy", "legal.html", "privacy", "site", "privacy.title", None),
    ("terms", "legal.html", "terms", "site", "terms.title", None),
]
PATHS = {p[0]: p[2] for p in PAGES}

# فونت‌ها: فارسی با Vazirmatn؛ انگلیسی با Inter (Vazirmatn فقط برای برچسب «فارسی»)
FONTS = {
    "fa": '<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap" rel="stylesheet">',
    "en": '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Vazirmatn:wght@500;700&display=swap" rel="stylesheet">',
}

# ---------- آیکون‌ها ----------
ICONS = {
    "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    "chevron": '<path d="M6 9l6 6 6-6"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "x": '<path d="M6 6l12 12M18 6L6 18"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5"/>',
    "home": '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "folder": '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    "chat": '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H10l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    "gear": '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    "shield": '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    "logout": '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M16 8l4 4-4 4M20 12H9"/>',
    "bell": '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "upload": '<path d="M12 16V5M7 10l5-5 5 5"/><path d="M4 19h16"/>',
    "file": '<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/>',
    "up": '<path d="M12 19V5M6 11l6-6 6 6"/>',
    "copy": '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    "trash": '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    "camera": '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
}
GOOGLE = ('<svg class="brand brand-google" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
          '<path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"/>'
          '<path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.09A12 12 0 0 0 12 24z"/>'
          '<path fill="#FBBC05" d="M5.29 14.3A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.3V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.09z"/>'
          '<path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.09C6.23 6.88 8.88 4.77 12 4.77z"/></svg>')


def icon(name):
    return (f'<svg class="ico ico-{name}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
            f'{ICONS[name]}</svg>')


def brand(name):
    if name == "google":
        return GOOGLE
    d = LOGOS[name]
    return (f'<svg class="brand brand-{name}" viewBox="{d["vb"]}" aria-hidden="true" focusable="false">'
            f'<path d="{d["paths"][0]}"/></svg>')


# ---------- مسیرها ----------
def depth(path):
    return 1 + (len([s for s in path.split("/") if s]))


def rel_url(from_lang, from_path, to_lang, to_path):
    """آدرس نسبی بین دو صفحه (پوشه‌ای با / پایانی)"""
    start = pathlib.PurePosixPath(from_lang) / from_path
    dest = pathlib.PurePosixPath(to_lang) / to_path
    r = os.path.relpath(str(dest), str(start)).replace("\\", "/")
    return "./" if r == "." else r + "/"


def read(p):
    return (SRC / p).read_text(encoding="utf-8")


def render(template, ctx, tr, depth_prefix):
    # include ها
    for _ in range(4):  # include ها می‌توانند include دیگری داشته باشند
        template = re.sub(r"\{\{>([\w\-]+)\}\}", lambda m: read(f"partials/{m.group(1)}.html"), template)

    def directive(m):
        d = m.group(1)
        if d.startswith("url:"):
            key = d[4:]
            return rel_url(ctx["lang"], ctx["path"], ctx["lang"], PATHS[key])
        if d.startswith("icon:"):
            return icon(d[5:])
        if d.startswith("brand:"):
            return brand(d[6:])
        table = {
            "lang": ctx["lang"], "dir": ctx["dir"], "LANG": ctx["lang"].upper(),
            "altLang": ctx["alt"], "ALTLANG": ctx["alt"].upper(),
            "altUrl": rel_url(ctx["lang"], ctx["path"], ctx["alt"], ctx["path"]),
            "root": depth_prefix, "year": str(YEAR), "page": ctx["key"],
            "siteUrl": SITE_URL, "content": ctx.get("content", ""),
            "title": ctx.get("title", ""), "desc": ctx.get("desc", ""),
            "hreflang": ctx.get("hreflang", ""),
            "legalBody": ctx.get("legalBody", ""), "legalIntro": ctx.get("legalIntro", ""),
            "langItems": ctx.get("langItems", ""), "fonts": ctx.get("fonts", ""),
            "h1": ctx.get("h1", ""), "today": ctx.get("today", ""),
        }
        if d in table:
            return table[d]
        raise KeyError(f"دستور ناشناخته: {{{{@{d}}}}}")

    for _ in range(4):  # متن‌ها ممکن است خودشان دستور داشته باشند
        new = re.sub(r"\{\{([\w.\-]+)\}\}", lambda m: tr[m.group(1)] if m.group(1) in tr else m.group(0), template)
        new = re.sub(r"\{\{@([^}]+)\}\}", directive, new)
        if new == template:
            break
        template = new
    left = re.findall(r"\{\{[^}]+\}\}", template)
    if left:
        raise KeyError(f"جانشین حل‌نشده در {ctx['key']}/{ctx['lang']}: {left[:5]}")
    return template


def main():
    trs = {l: json.loads((ROOT / "i18n" / f"{l}.json").read_text(encoding="utf-8")) for l in ("fa", "en")}
    # فایل‌های ترجمه برای مرورگر
    for l, d in trs.items():
        (ROOT / "i18n" / f"{l}.js").write_text("window.I18N=" + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";", encoding="utf-8")

    count = 0
    for lang in ("fa", "en"):
        alt = "en" if lang == "fa" else "fa"
        tr = trs[lang]
        for key, tpl, path, layout, title_key, desc_key in PAGES:
            ctx = {"key": key, "lang": lang, "alt": alt, "dir": "rtl" if lang == "fa" else "ltr", "path": path}
            pref = "../" * depth(path)
            title = "Behnam | Portfolio" if not title_key else f"{tr[title_key]} | Behnam"
            if key == "auth":
                title = f"ACCOUNT ACCESS | Behnam"
            ctx["title"] = title
            ctx["desc"] = tr[desc_key] if desc_key else tr["home.desc"]
            ctx["hreflang"] = "".join(
                f'<link rel="alternate" hreflang="{l}" href="{SITE_URL}{l}/{path + "/" if path else ""}">' for l in ("fa", "en"))
            ctx["h1"] = tr[title_key] if title_key else ""
            ctx["today"] = datetime.date.today().isoformat()
            if tpl == "legal.html":
                ctx["legalBody"] = tr[f"{key}.body"]
                ctx["legalIntro"] = tr[f"{key}.intro"]
            # گزینه‌های منوی زبان (آدرس نسبی به همین صفحه در زبان دیگر)
            items = ""
            for l in ("fa", "en"):
                cur = (l == lang)
                href = "./" if cur else rel_url(lang, path, l, path)
                cls = "lang-item is-current" if cur else "lang-item"
                aria = ' aria-current="true"' if cur else ""
                items += (f'<li role="none"><a role="menuitem" class="{cls}"{aria} href="{href}" '
                          f'hreflang="{l}" lang="{l}" data-set-lang="{l}">{tr["lang." + l]}</a></li>')
            ctx["langItems"] = items
            ctx["fonts"] = FONTS[lang]
            page_html = render(read(f"pages/{tpl}"), ctx, tr, pref)
            ctx["content"] = page_html
            # محتوا قبلاً رندر شده؛ چیدمان را جدا رندر می‌کنیم (بدون رندر دوباره محتوا)
            layout_tpl = read(f"layouts/{layout}.html").replace("{{@content}}", "\x00CONTENT\x00")
            full = render(layout_tpl, ctx, tr, pref).replace("\x00CONTENT\x00", page_html)
            out = ROOT / lang / path / "index.html" if path else ROOT / lang / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(full, encoding="utf-8")
            count += 1

    # ریشه سایت: انتخاب زبان
    (ROOT / "index.html").write_text(read("root-redirect.html"), encoding="utf-8")
    (ROOT / "404.html").write_text(read("404.html"), encoding="utf-8")
    print("pages:", count)


if __name__ == "__main__":
    main()
