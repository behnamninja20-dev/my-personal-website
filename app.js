/* ============================================================
   BEHNAM PORTFOLIO — رفتارهای تعاملی و بهینه‌شده
   نکته: نشانی ایمیل و شناسه تلگرام را پس از آماده شدن در تنظیمات زیر وارد کن.
   ارسال پیامک واقعی، ذخیره حساب و پنل کاربری به بک‌اند نیاز دارد.
============================================================ */
(() => {
  "use strict";

  /* -------------------- تنظیمات قابل تغییر -------------------- */
  const CONFIG = {
    email: "",                 // مثال: hello@example.com
    telegram: "",              // فقط شناسه، بدون @؛ مثال: behnam_id
    phone: "+989130930344",    // شماره تماس اعلام‌شده
    demoOtp: "12345"           // کد نمایشی؛ در نسخه واقعی از سرور دریافت شود.
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------- ابزارهای کمکی -------------------- */
  let toastTimer;
  function showToast(message) {
    const toast = $("#site-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* حالت خصوصی مرورگر */ }
  }

  /* -------------------- لودینگ آغازین -------------------- */
  function runLoader() {
    const loader = $("#site-loader");
    if (!loader) return;

    const words = ["IDEAS", "DESIGN", "DIGITAL"];
    const wordNode = $("#loader-word");
    let index = 0;

    if (reducedMotion) {
      loader.classList.add("is-leaving");
      window.setTimeout(() => loader.remove(), 100);
      return;
    }

    // واژه دوم هر بار با افکت کوتاه عوض می‌شود؛ کل لودینگ به بارگذاری فونت وابسته نیست.
    const wordInterval = window.setInterval(() => {
      index += 1;
      if (index < words.length && wordNode) {
        wordNode.textContent = words[index];
        wordNode.style.animation = "none";
        void wordNode.offsetWidth;
        wordNode.style.animation = "wordCycle .85s ease both";
      }
    }, 850);

    // پس از سه واژه، خوش‌آمدگویی کوتاه و سپس خروج نرم اجرا می‌شود.
    window.setTimeout(() => {
      window.clearInterval(wordInterval);
      loader.classList.add("show-welcome");
    }, 2700);

    window.setTimeout(() => {
      loader.classList.add("is-leaving");
      window.setTimeout(() => loader.remove(), 800);
    }, 3450);
  }

  /* -------------------- پوسته روشن و تیره -------------------- */
  function initTheme() {
    const button = $(".theme-toggle");
    if (!button) return;

    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      safeStorageSet("behnam-theme", next);
      button.setAttribute("aria-label", next === "dark" ? "فعال‌سازی پوسته روشن" : "فعال‌سازی پوسته تیره");
    });
  }

  /* -------------------- منوی موبایل -------------------- */
  function initNavigation() {
    const nav = $("#main-nav");
    const menuButton = $(".menu-toggle");
    const header = $(".site-header");
    if (!nav || !menuButton) return;

    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      menuButton.classList.toggle("active", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
    };

    menuButton.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    $$('a[href^="#"]', nav).forEach(link => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("click", event => {
      if (header && !header.contains(event.target)) setMenu(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setMenu(false);
    });

    // مشخص کردن لینک بخش فعال هنگام اسکرول؛ یک ناظر مشترک و سبک.
    const sections = $$("main section[id]");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          $$(".nav-link").forEach(link => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });
      sections.forEach(section => observer.observe(section));
    }
  }

  /* -------------------- نمایش تدریجی بخش‌ها -------------------- */
  function initReveal() {
    const elements = $$(".reveal");
    if (!elements.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(element => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    elements.forEach((element, index) => {
      // تأخیر بسیار کم و محدود برای ایجاد ریتم؛ از انیمیشن‌های سنگین پرهیز شده است.
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      observer.observe(element);
    });
  }

  /* -------------------- اطلاعات تماس و لینک‌ها -------------------- */
  function initContactLinks() {
    const emailLinks = $$('[data-contact-email]');
    const telegramLinks = $$('[data-contact-telegram]');

    emailLinks.forEach(link => {
      if (CONFIG.email.trim()) {
        link.href = `mailto:${CONFIG.email.trim()}`;
      } else {
        link.href = "#request";
        link.addEventListener("click", event => {
          event.preventDefault();
          showToast("برای فعال شدن ایمیل، نشانی آن را در ابتدای فایل app.js وارد کن.");
        });
      }
    });

    telegramLinks.forEach(link => {
      if (CONFIG.telegram.trim()) {
        link.href = `https://t.me/${CONFIG.telegram.trim().replace(/^@/, "")}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.href = "#request";
        link.addEventListener("click", event => {
          event.preventDefault();
          showToast("برای فعال شدن تلگرام، شناسه آن را در ابتدای فایل app.js وارد کن.");
        });
      }
    });
  }

  /* -------------------- فرم سفارش پروژه -------------------- */
  function collectProjectForm(form) {
    const data = new FormData(form);
    return [
      "سلام، برای ثبت درخواست پروژه پیام می‌دهم.",
      "",
      `نام: ${data.get("name") || "-"}`,
      `راه ارتباطی: ${data.get("reply") || "-"}`,
      `نوع پروژه: ${data.get("projectType") || "-"}`,
      `بودجه: ${data.get("budget") || "مشخص نشده"}`,
      "",
      "توضیحات:",
      data.get("details") || "-"
    ].join("\n");
  }

  function initProjectForm() {
    const form = $("#project-form");
    const note = $("#form-note");
    const telegramButton = $("#send-telegram");
    if (!form) return;

    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!CONFIG.email.trim()) {
        if (note) note.textContent = "ابتدا ایمیل مقصد را در ابتدای app.js وارد کن؛ متن فرم آماده است اما نشانی مقصد تنظیم نشده.";
        showToast("نشانی ایمیل مقصد هنوز تنظیم نشده است.");
        return;
      }
      const subject = encodeURIComponent("درخواست همکاری / ثبت پروژه");
      const body = encodeURIComponent(collectProjectForm(form));
      window.location.href = `mailto:${CONFIG.email.trim()}?subject=${subject}&body=${body}`;
      if (note) note.textContent = "برنامه ایمیل باز می‌شود؛ ارسال نهایی را در برنامه خودت تأیید کن.";
    });

    telegramButton?.addEventListener("click", () => {
      if (!form.reportValidity()) return;
      const message = collectProjectForm(form);
      const url = CONFIG.telegram.trim()
        ? `https://t.me/${CONFIG.telegram.trim().replace(/^@/, "")}?text=${encodeURIComponent(message)}`
        : `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      if (note) note.textContent = "متن درخواست برای تلگرام آماده شد؛ در صورت نیاز آن را در گفتگو ارسال کن.";
    });
  }

  /* -------------------- پنجره ورود نمایشی -------------------- */
  function initLogin() {
    const dialog = $("#login-dialog");
    if (!dialog) return;

    const steps = $$(".login-step", dialog);
    const progress = $$(".progress-step", dialog);
    const phoneInput = $("#login-phone");
    const otpInputs = $$(".otp-input", dialog);
    const maskedPhone = $("#masked-phone");
    const usernameInput = $("#login-username");
    let phoneValue = "";
    let lastFocused = null;

    const showStep = name => {
      steps.forEach(step => step.classList.toggle("active", step.dataset.loginStep === name));
      const order = ["phone", "otp", "username", "complete"];
      const current = order.indexOf(name);
      progress.forEach((item, index) => {
        item.classList.toggle("active", index === Math.min(current, 2));
        item.classList.toggle("done", index < current);
      });
    };

    const openDialog = () => {
      lastFocused = document.activeElement;
      dialog.hidden = false;
      document.body.style.overflow = "hidden";
      showStep("phone");
      window.setTimeout(() => phoneInput?.focus(), 80);
    };
    const closeDialog = () => {
      dialog.hidden = true;
      document.body.style.overflow = "";
      lastFocused?.focus?.();
    };

    $$('[data-open-login]').forEach(button => button.addEventListener("click", openDialog));
    $$('[data-close-login]').forEach(button => button.addEventListener("click", closeDialog));
    dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !dialog.hidden) closeDialog();
    });

    $("#phone-form")?.addEventListener("submit", event => {
      event.preventDefault();
      const digits = (phoneInput?.value || "").replace(/\D/g, "");
      if (!/^9\d{9}$/.test(digits)) {
        showToast("شماره موبایل باید با ۹ شروع شود و ۱۰ رقم داشته باشد.");
        phoneInput?.focus();
        return;
      }
      phoneValue = digits;
      if (maskedPhone) maskedPhone.textContent = `+98 ${digits.slice(0,3)} *** ${digits.slice(-2)}`;
      otpInputs.forEach(input => { input.value = ""; input.classList.remove("filled"); });
      showStep("otp");
      window.setTimeout(() => otpInputs[0]?.focus(), 80);
      showToast("حالت نمایشی: کد آزمایشی 12345 را وارد کن.");
    });

    // هر رقم در خانه خودش می‌نشیند؛ خط خانه قبلی روشن می‌ماند و خانه بعدی فعال می‌شود.
    otpInputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        const digit = input.value.replace(/\D/g, "").slice(-1);
        input.value = digit;
        input.classList.toggle("filled", Boolean(digit));
        if (digit && index < otpInputs.length - 1) otpInputs[index + 1].focus();
      });
      input.addEventListener("keydown", event => {
        if (event.key === "Backspace" && !input.value && index > 0) {
          otpInputs[index - 1].focus();
          otpInputs[index - 1].value = "";
          otpInputs[index - 1].classList.remove("filled");
        }
        if (event.key === "ArrowLeft" && index < otpInputs.length - 1) otpInputs[index + 1].focus();
        if (event.key === "ArrowRight" && index > 0) otpInputs[index - 1].focus();
      });
      input.addEventListener("paste", event => {
        const pasted = (event.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 5);
        if (!pasted) return;
        event.preventDefault();
        [...pasted].forEach((digit, digitIndex) => {
          if (!otpInputs[digitIndex]) return;
          otpInputs[digitIndex].value = digit;
          otpInputs[digitIndex].classList.add("filled");
        });
        otpInputs[Math.min(pasted.length, 4)]?.focus();
      });
    });

    $("#otp-form")?.addEventListener("submit", event => {
      event.preventDefault();
      const code = otpInputs.map(input => input.value).join("");
      if (code.length !== 5) {
        showToast("هر پنج رقم کد را وارد کن.");
        otpInputs.find(input => !input.value)?.focus();
        return;
      }
      if (code !== CONFIG.demoOtp) {
        showToast("کد آزمایشی درست نیست. برای تست از 12345 استفاده کن.");
        otpInputs.forEach(input => { input.value = ""; input.classList.remove("filled"); });
        otpInputs[0]?.focus();
        return;
      }
      showStep("username");
      window.setTimeout(() => usernameInput?.focus(), 80);
    });

    $("[data-back-phone]")?.addEventListener("click", () => showStep("phone"));
    $("#username-form")?.addEventListener("submit", event => {
      event.preventDefault();
      const username = (usernameInput?.value || "").trim();
      if (!/^[\p{L}\p{N}_.-]{3,24}$/u.test(username)) {
        showToast("نام کاربری باید ۳ تا ۲۴ نویسه و بدون فاصله باشد.");
        usernameInput?.focus();
        return;
      }
      const message = $("#login-success-message");
      if (message) message.textContent = `خوش آمدی ${username}؛ این ورود فقط نمایشی است و هنوز حسابی در سرور ساخته نشده.`;
      showStep("complete");
    });
  }

  /* -------------------- سال جاری و آغاز برنامه -------------------- */
  function initFooter() {
    const year = $("#current-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function init() {
    runLoader();
    initTheme();
    initNavigation();
    initReveal();
    initContactLinks();
    initProjectForm();
    initLogin();
    initFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
