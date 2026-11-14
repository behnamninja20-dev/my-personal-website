# Behnam Portfolio — نسخه ۲ (دو زبانه + ورود + پنل کاربری)

وب‌سایت شخصی بهنام روی GitHub Pages. این نسخه **فرانت‌اند کامل** سیستم عضویت، ثبت پروژه، مشاوره، پنل کاربری و دو زبانه‌بودن را اضافه می‌کند.

> ## ⚠️ وضعیت صادقانه
> **بک‌اند متصل نیست.** GitHub Pages فقط فایل ثابت سرو می‌کند؛ پیامک OTP، حساب کاربری، دیتابیس، OAuth و کنترل دسترسی سمت سرور روی آن اجرا نمی‌شوند.
> تا وقتی بک‌اند وصل نشود، روی سایت عمومی: صفحه ورود یک هشدار نشان می‌دهد و فرم‌هایش غیرفعال است؛ فرم مشاوره پیام «به سرور متصل نشده» می‌دهد؛ هیچ ورود یا ثبت جعلی وجود ندارد.
> رابط کاربری با یک «حالت توسعه» (فقط روی `localhost`) کامل تست شده است؛ این حالت روی دامنه عمومی **هرگز** فعال نمی‌شود.

---

## ۱) ساختار پروژه

```
index.html            انتخاب زبان و انتقال به /fa/ یا /en/   (تولیدشده)
404.html
fa/  en/              صفحات ساخته‌شده برای هر زبان            (تولیدشده؛ دستی ویرایش نکن)
  index.html          صفحه اصلی
  auth/               ورود و ثبت‌نام (ACCOUNT ACCESS)
  dashboard/          پنل: /  projects/  projects/new/  consultations/  settings/
  privacy/  terms/
src/                  منبع صفحات
  pages/ partials/ layouts/    قالب‌ها (HTML بدون تکرار برای دو زبان)
  strings_site.py  strings_app.py  strings_legal.py     ← منبع مرکزی ترجمه‌ها (FA و EN کنار هم)
  convert_home.py     (یک‌بار مصرف) تبدیل index.html قدیمی به قالب
i18n/fa.json en.json  خروجی ترجمه (تولیدشده)   |  i18n/fa.js en.js  برای مرورگر (تولیدشده)
css/forms.css pages.css auth.css dash.css      استایل بخش‌های جدید
style.css             استایل قبلی سایت (فقط ویژگی‌های راست‌به‌چپ ثابت، منطقی شدند)
js/config.js          ← تنظیمات قابل ویرایش (تماس، اتصال به سرور)
js/api.js             لایه ارتباط با سرور (remote / none / mock)
js/ui.js site.js auth.js dashboard.js countries.js i18n.js
app.js                اسکریپت قبلی (جزئیات تغییرات در بخش ۹)
favicon.svg favicon.ico apple-touch-icon.png icon-192.png icon-512.png site.webmanifest
backend/supabase/migrations/001_init.sql     اسکیمای دیتابیس + RLS (اجرا نشده)
backend/.env.example                          متغیرهای محیطی بک‌اند
backup-before-v2/     نسخه قبلی سایت (پیش از شروع)
```

## ۲) ساخت و انتشار

نیازی به npm نیست؛ فقط Python 3:

```bash
python3 make_i18n.py     # ساخت i18n/*.json از src/strings_*.py
python3 build.py         # ساخت fa/ و en/ و index.html
```

پس از هر تغییر در `src/` دوباره اجرا کن و خروجی را commit کن. همه آدرس‌ها **نسبی** هستند، پس روی GitHub Pages (زیرمسیر `/BehnamPortfolio/`) و هر دامنه دیگر کار می‌کنند.
تنها استثنا `404.html` است که مسیر `/BehnamPortfolio/` را دارد؛ اگر دامنه اختصاصی گرفتی آن را عوض کن.

اجرای محلی: `python3 -m http.server 8000` سپس `http://localhost:8000/`.

### ساختار آدرس‌ها

| صفحه | فارسی | انگلیسی |
|---|---|---|
| صفحه اصلی | `/fa/` | `/en/` |
| ورود و ثبت‌نام | `/fa/auth/` (`#register` برای ثبت‌نام) | `/en/auth/` |
| پنل | `/fa/dashboard/` | `/en/dashboard/` |
| ثبت پروژه | `/fa/dashboard/projects/new/` | … |
| پروژه‌های من | `/fa/dashboard/projects/` | … |
| مشاوره‌ها | `/fa/dashboard/consultations/` | … |
| تنظیمات / امنیت | `/fa/dashboard/settings/` (`#security`) | … |
| حریم خصوصی / قوانین | `/fa/privacy/` `/fa/terms/` | … |

## ۳) سیستم دو زبانه

- همه متن‌ها در `src/strings_*.py` (کلید ← فارسی، انگلیسی). برای ویرایش متن فقط همان‌جا را عوض کن، سپس build.
- هر صفحه برای هر زبان با `lang` و `dir` درست ساخته می‌شود (`fa`/`rtl` و `en`/`ltr`)؛ لینک مستقیم و اشتراک‌گذاری کار می‌کند.
- زبان در `localStorage` ذخیره می‌شود؛ `/` به زبان ذخیره‌شده یا زبان مرورگر می‌رود. تغییر زبان، آدرس صفحه را در زبان دیگر باز می‌کند و `?query` و `#hash` را حفظ می‌کند.
- پیام‌های خطا، فرم‌ها، OTP، پنل و فوتر همگی از همین دیکشنری (`window.I18N`) خوانده می‌شوند.

## ۴) تنظیمات تماس

در `js/config.js`:

```js
phone: "+989130930344",
telegram: "YOUR_TELEGRAM_ID",   // تا وقتی YOUR_… است لینک ساخته نمی‌شود
email: "YOUR_EMAIL@gmail.com",  // تا وقتی YOUR_… است mailto ساخته نمی‌شود
socials: []                     // [{ name: "GitHub", url: "https://…" }]
```

مقدار واقعی را بگذار؛ کارت‌ها، فوتر و لینک‌ها خودکار فعال می‌شوند.

## ۵) راه‌اندازی بک‌اند (قرارداد API)

فرانت‌اند آماده است؛ کافی است `api.baseUrl` در `js/config.js` را پر کنی و سرور زیر را پیاده‌سازی کنی. همه درخواست‌ها `credentials: include` و هدر `X-CSRF-Token` (غیر از GET) دارند. خطاها: `{ "error": { "code": "...", "message": "..." } }`.

| متد و مسیر | کار | کدهای خطای مورد انتظار |
|---|---|---|
| `GET /auth/session` | `{ user, csrfToken }` یا ۴۰۱ | `UNAUTHENTICATED` |
| `POST /auth/otp/request` `{purpose,method,target,username?,displayName?}` | ساخت و ارسال کد ۵ رقمی ← `{resendAfter,expiresIn}` | `ACCOUNT_NOT_FOUND` `ACCOUNT_EXISTS` `USERNAME_TAKEN` `VALIDATION` `RATE_LIMITED` |
| `POST /auth/otp/verify` `{purpose,method,target,code}` | بررسی و ساخت نشست ← `{user,isNew,csrfToken}` | `INVALID_CODE` `CODE_EXPIRED` `TOO_MANY_ATTEMPTS` |
| `GET /auth/oauth/{google\|apple}/start?next=` | شروع OAuth (redirect) | |
| `POST /auth/logout` `/auth/logout-all` | پایان نشست در سرور | |
| `GET /auth/username-available?u=` | `{available}` | |
| `PATCH /me` | `displayName`, `username` (محدودیت ۳۰ روز), `avatar` | `USERNAME_TAKEN` `USERNAME_LOCKED` |
| `POST /me/contact/request` `/me/contact/verify` | تغییر ایمیل/شماره با کد | |
| `DELETE /me` `{confirm}` | حذف کامل حساب | |
| `POST /projects` (multipart: `data` + `files`) | ثبت پروژه؛ سرور `owner_id`، `tracking_code` و `status=submitted` را تعیین می‌کند | `UNAUTHENTICATED` `VALIDATION` |
| `GET /projects` | فقط پروژه‌های همان کاربر | |
| `POST /consultations` | مهمان هم مجاز است؛ با محدودیت نرخ و کپچا | `RATE_LIMITED` |
| `GET /consultations` | فقط مال خود کاربر | |
| `GET /notifications` · `POST /notifications/read-all` | | |

### معماری پیشنهادی
**Supabase** (PostgreSQL + Auth + Storage + Edge Functions) برای دیتابیس، RLS و ذخیره فایل مناسب است و `backend/supabase/migrations/001_init.sql` برایش نوشته شده. نکات مهم:

1. **OTP ۵ رقمی:** ورود پیامکی آماده Supabase طولش ۶ رقم است (طول را در مستندات فعلی‌شان بررسی کن). برای ۵ رقم، OTP را خودت در Edge Function بساز: کد تصادفی با CSPRNG، ذخیره فقط **هش HMAC** (جدول `otp_challenges`)، انقضا ۵ دقیقه، یک‌بارمصرف، حداکثر ۵ تلاش، محدودیت ارسال مجدد و سقف ارسال به‌ازای شماره و IP. پس از تأیید، نشست بساز.
2. **کوکی نشست** باید `HttpOnly; Secure; SameSite=None` باشد (چون سایت و API دو Origin هستند) و CORS فقط Origin سایت را مجاز کند. CSRF با هدر `X-CSRF-Token` بررسی شود.
3. **پیامک:** یک ارائه‌دهنده انتخاب کن (برای شماره‌های ایران معمولاً سرویس داخلی، برای خارج Twilio یا مشابه) و کلیدش را فقط در Secrets سرور بگذار.
4. **ایمیل:** SMTP یا سرویسی مثل Resend/Postmark؛ دامنه فرستنده با SPF/DKIM تنظیم شود.
5. **آپلود فایل:** نوع (با خواندن محتوای فایل، نه فقط پسوند)، حجم و تعداد در سرور بررسی شود؛ سطل Storage خصوصی باشد (در migration آمده) و نام فایل با UUID ساخته شود.
6. **حالت آزمایشی:** هیچ شماره/کد آزمایشی در سرور production فعال نباشد (`APP_ENV=production`). در فرانت‌اند، `mock` فقط روی `localhost` است.

### راه‌اندازی OAuth
**Google:** Google Cloud Console ← OAuth consent screen ← Credentials ← OAuth client (Web). Redirect URI را به آدرس callback سرور خودت بده. در callback: `state` (ضد CSRF) و `nonce` را بررسی کن، `id_token` را در سرور اعتبارسنجی کن (`iss` = `accounts.google.com`، `aud` = Client ID، امضا، انقضا)، سپس حساب را با `sub` به کاربر موجود وصل کن (ساخت حساب تکراری نشود). اگر کاربر جدید است و نام کاربری ندارد، قبل از ساخت حساب از او نام کاربری بگیر.
**Apple:** Apple Developer ← Identifiers ← Services ID + Sign in with Apple + Key (.p8). Client Secret از JWT امضاشده با کلید `.p8` ساخته می‌شود (سمت سرور). `id_token` با کلیدهای عمومی Apple اعتبارسنجی شود (`iss=https://appleid.apple.com`, `aud`=Service ID). Apple فقط بار اول نام و ایمیل را می‌دهد؛ ذخیره کن.
پس از آماده شدن، در `js/config.js` مقدار `oauthProviders.google/apple` را `true` کن. دکمه‌ها از همین حالا با لوگوی رسمی (Google رنگی، Apple سیاه/سفید طبق راهنمای برند) ساخته شده‌اند، ولی تا فعال‌سازی، پیام «هنوز فعال نشده» می‌دهند.

## ۶) امنیت (وضعیت و الزامات)

- همه متن‌های ورودی کاربر با `textContent` نمایش داده می‌شوند (نه `innerHTML`).
- آدرس بازگشت بعد از ورود (`?next=`) فقط هم‌مبدأ پذیرفته می‌شود.
- گیت ورود در فرانت‌اند فقط UX است. **کنترل واقعی** (احراز هویت، مالکیت پروژه، تغییرناپذیری وضعیت برای کاربر) باید سرور/RLS انجام دهد؛ migration آماده این‌ها را دارد.
- جلوگیری از شمارش حساب‌ها (account enumeration): الان پیام «حساب پیدا نشد» صریح است (تجربه کاربری بهتر). اگر حساسیت امنیتی بیشتری می‌خواهی، سرور پیام یکسان برگرداند.
- محافظ کپی قدیمی `app.js` برای فیلدهای فرم و `data-allow-copy` استثنا دارد.

## ۷) گزارش تست

تست خودکار با Playwright (Chromium) روی `localhost` و حالت توسعه:

- **چیدمان:** ۳۲۰، ۳۶۰، ۳۷۵، ۳۹۰، ۴۱۴، ۴۳۰، ۶۰۰، ۷۶۸، ۸۲۰، ۱۰۲۴، ۱۲۸۰، ۱۴۴۰، ۱۹۲۰ پیکسل؛ فارسی و انگلیسی؛ صفحات اصلی، ورود، ثبت‌نام، حریم خصوصی، پنل؛ بدون اسکرول افقی، بدون عنصر بیرون‌زده، بدون خطای کنسول (تم تاریک روی ۳۲۰/۳۹۰/۷۶۸/۱۲۸۰).
- **سناریوها (۷۵ بررسی):** مهمان به ورود می‌رود و بعد از ورود به مقصد برمی‌گردد؛ API ثبت پروژه برای مهمان رد می‌شود؛ ثبت‌نام با موبایل (ارقام فارسی، اعتبارسنجی)، OTP اشتباه (لرزش و پاک‌شدن)، paste، منقضی، سقف تلاش، تایمر؛ فرم ۵ مرحله‌ای، اعتبارسنجی فایل (نوع/حجم/حذف)، شماره پیگیری یکتا، وضعیت و اعلان؛ جداسازی پروژه‌های دو کاربر؛ مشاوره مهمان و پر شدن خودکار برای کاربر واردشده؛ تغییر زبان و جهت، ذخیره و refresh؛ تم؛ لینک تلفن و غیرفعال‌بودن تلگرام/ایمیل placeholder؛ ویرایش پروفایل، محدودیت تغییر نام کاربری، تغییر شماره با کد، خروج، حذف حساب.

**تست نشده (نیاز به سرویس خارجی):** پیامک و ایمیل واقعی، ورود Google/Apple، `remote` adapter روی سرور واقعی، migration روی PostgreSQL، آپلود واقعی، RLS. هیچ‌کدام عملیاتی اعلام نمی‌شوند.
همچنین روی مرورگر/گوشی واقعی (Safari iOS، Samsung Internet) تست نشده؛ فقط Chromium.

## ۸) عملکرد

CSS/JS بدون وابستگی خارجی؛ جز فونت Google، پرچم‌ها (flag-icons، نسخه ثابت، فقط در انتخاب کشور) و لوگوی Adobe (Devicon). انیمیشن‌ها فقط `transform/opacity` و با `prefers-reduced-motion` غیرفعال می‌شوند. پیشنهاد بعدی: ترکیب و minify کردن CSS/JS و حذف CSS استفاده‌نشده در هر صفحه.

## ۹) تغییرات روی فایل‌های قبلی

- `style.css`: فقط `direction: rtl` ثابت در بخش‌های مهارت/ابزار حذف و `text-align: right` به `start` تبدیل شد (برای انگلیسی).
- `app.js`: متن‌های `aria-label` از سیستم ترجمه خوانده می‌شوند؛ بلوک «۱۱» که به متغیرهای تعریف‌نشده اشاره می‌کرد و هنگام تغییر تب خطا می‌داد حذف شد؛ copy/cut در فیلدهای فرم آزاد شد.
- Hero، کارت کد، مهارت‌ها، ابزارها و پروژه‌های قبلی: ساختار و ظاهر حفظ شده؛ HTML آن‌ها از فایل قبلی ساخته می‌شود (فقط متن‌ها به کلید ترجمه تبدیل شدند). دکمه «ثبت پروژه» هیرو اکنون به فرم ثبت پروژه (پشت ورود) می‌رود.

## ۱۰) موارد باز

- متن حریم خصوصی و قوانین یک پیش‌نویس عمومی است؛ مدت نگهداری و ارائه‌دهندگان واقعی را پس از انتخاب سرویس‌ها به‌روز کن و در صورت نیاز با مشاور حقوقی بازبینی کن.
- لینک «ابزارها» به منوی اصلی هدر اضافه نشده (در فوتر هست).
- لوگوی Adobe از CDN بارگذاری می‌شود؛ اگر نیامد، فایل رسمی را دانلود و در `assets/` بگذار.
- لیست شبکه‌های اجتماعی خالی است (لینک واقعی نداشتم).

## ۱۱) تست‌های خودکار
پوشه `tests/` شامل اسکریپت‌های Playwright (`test_flows.js`, `test_layout.js`) و `make_icons.js` است. برای اجرا Playwright را نصب کن، سرور محلی را روی پورت 8765 بالا بیاور و مسیر `require` بالای فایل را به نصب خودت تغییر بده.
