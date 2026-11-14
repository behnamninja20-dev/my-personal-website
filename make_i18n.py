# -*- coding: utf-8 -*-
"""تولید فایل‌های ترجمه مرکزی (i18n/fa.json و i18n/en.json) از منابع src/strings_*.py"""
import json, importlib.util, pathlib
ROOT = pathlib.Path(__file__).parent
fa, en = {}, {}
for name in ("strings_site", "strings_app", "strings_legal"):
    spec = importlib.util.spec_from_file_location(name, ROOT / "src" / f"{name}.py")
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    for k, (f, e) in mod.S.items():
        assert k not in fa, f"کلید تکراری: {k}"
        fa[k], en[k] = f, e
(ROOT / "i18n").mkdir(exist_ok=True)
for lang, d in (("fa", fa), ("en", en)):
    (ROOT / "i18n" / f"{lang}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
print("keys:", len(fa))
