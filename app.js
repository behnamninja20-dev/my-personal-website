document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // 1. دریافت عناصر اصلی صفحه
    // =========================================================

    const root = document.documentElement;
    const body = document.body;

    const loader = document.getElementById("loading-screen");
    const header = document.querySelector(".navbar");

    const menu = document.getElementById("main-menu");
    const menuBtn = document.querySelector(".menu-toggle");

    const themeBtn = document.querySelector(".theme-toggle");



    // =========================================================
    // 2. نمایش نرم صفحه و مدیریت لودینگ
    // =========================================================

    let pageStarted = false;
    let loaderRemoved = false;

    if (loader) {
        body.classList.add("loading-active");
    }

    function showPage() {
        if (pageStarted) return;

        pageStarted = true;

        body.classList.add("page-ready");

        if (loader && !loaderRemoved) {
            loader.classList.add("hide");

            window.setTimeout(() => {
                if (loader.isConnected) {
                    loader.remove();
                }

                body.classList.remove("loading-active");
                loaderRemoved = true;

            }, 600);

        } else {
            body.classList.remove("loading-active");
        }
    }

    if (document.readyState === "complete") {
        window.setTimeout(showPage, 250);
    } else {
        window.addEventListener("load", showPage, { once: true });
    }

    // جلوگیری از گیر کردن لودینگ
    window.setTimeout(showPage, 5000);


    // =========================================================
    // 3. مدیریت منوی موبایل
    // =========================================================

    function setMenu(open) {
        if (!menu || !menuBtn) return;

        menu.classList.toggle("open", open);
        menuBtn.classList.toggle("active", open);

        menuBtn.setAttribute("aria-expanded", String(open));

        menuBtn.setAttribute(
            "aria-label",
            open
                ? (window.t ? window.t("aria.menuClose") : "بستن منو")
                : (window.t ? window.t("aria.menuOpen") : "باز کردن منو")
        );
    }

    if (menu && menuBtn) {

        menuBtn.addEventListener("click", () => {
            const isOpen = menu.classList.contains("open");
            setMenu(!isOpen);
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                setMenu(false);
            });
        });

        document.addEventListener("click", event => {
            if (!header) return;

            if (!header.contains(event.target)) {
                setMenu(false);
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                setMenu(false);
            }
        });

        const desktopQuery = window.matchMedia("(min-width: 768px)");

        const handleScreenChange = event => {
            if (event.matches) {
                setMenu(false);
            }
        };

        if (desktopQuery.addEventListener) {
            desktopQuery.addEventListener("change", handleScreenChange);
        } else {
            desktopQuery.addListener(handleScreenChange);
        }
    }


    // =========================================================
    // 4. مدیریت تم روز و شب
    // =========================================================

    function applyTheme(theme) {
        const validTheme = theme === "dark" ? "dark" : "light";

        root.setAttribute("data-theme", validTheme);

        if (themeBtn) {
            themeBtn.setAttribute(
                "aria-label",
                validTheme === "dark"
                    ? (window.t ? window.t("aria.themeToDay") : "تغییر به حالت روز")
                    : (window.t ? window.t("aria.themeToNight") : "تغییر به حالت شب")
            );
        }

        try {
            localStorage.setItem("theme", validTheme);
        } catch (error) {
            // ادامه عملکرد سایت بدون ذخیره‌سازی
        }
    }

    let initialTheme = "light";

    try {
        initialTheme =
            localStorage.getItem("theme") ||
            root.getAttribute("data-theme") ||
            "light";
    } catch (error) {
        initialTheme = root.getAttribute("data-theme") || "light";
    }

    applyTheme(initialTheme);

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = root.getAttribute("data-theme");

            applyTheme(
                currentTheme === "dark" ? "light" : "dark"
            );
        });
    }


    // =========================================================
    // 5. تغییر ظاهر هدر هنگام اسکرول
    // =========================================================

    if (header) {
      let scrollScheduled = false;

      function updateHeader() {
        header.classList.toggle("is-scrolled", window.scrollY > 20);

        scrollScheduled = false;
      }

      window.addEventListener(
        "scroll",
        () => {
          if (scrollScheduled) return;

          scrollScheduled = true;
          window.requestAnimationFrame(updateHeader);
        },
        { passive: true },
      );

      updateHeader();

      // =========================================================
      // نمایش کارت کدنویسی هنگام اسکرول در موبایل
      // =========================================================

      const heroVisual = document.querySelector(".hero-visual");

      // این افکت فقط در نمایشگرهای موبایل فعال می‌شود.
      const mobileQuery = window.matchMedia("(max-width: 767px)");

      if (heroVisual && mobileQuery.matches && "IntersectionObserver" in window) {
        const heroVisualObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              // کارت فقط پس از شروع اسکرول و رسیدن به محدوده دید نمایش داده می‌شود.
              if (entry.isIntersecting && window.scrollY > 0) {
                heroVisual.classList.add("is-visible");

                // پس از نمایش، دیگر نیازی به بررسی کارت نیست.
                observer.unobserve(heroVisual);
              }
            });
          },
          {
            threshold: 0.1,
            rootMargin: "0px 0px -15% 0px",
          },
        );

        heroVisualObserver.observe(heroVisual);
      } else if (heroVisual && mobileQuery.matches) {
        // در مرورگرهای فاقد IntersectionObserver، کارت مخفی نمی‌ماند.
        heroVisual.classList.add("is-visible");
      }
    }

    // =========================================================
    // 6. نمایش بخش‌ها هنگام اسکرول (Scroll Reveal)
    // ---------------------------------------------------------
    // هر عنصر دارای data-reveal تا وقتی کاربر به آن نرسیده مخفی است
    // و با رسیدن به محدوده دید، انیمیشن مخصوص خودش را اجرا می‌کند.
    //
    // - عنوان هر بخش، هر کارت مهارت، هر دسته ابزار و پیام پایانی
    //   مستقل از هم نمایش داده می‌شوند.
    // - کارت‌های هم‌ردیف با فاصله زمانی کوتاه، پشت سر هم ظاهر می‌شوند.
    // - اگر JavaScript اجرا نشود یا کاربر کاهش حرکت را فعال کرده باشد،
    //   همه چیز بدون انیمیشن نمایش داده می‌شود.
    // =========================================================

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const revealItems = document.querySelectorAll("[data-reveal]");

    if (revealItems.length > 0) {

        // فعال کردن حالت مخفی اولیه (فقط وقتی JavaScript در حال اجراست)
        root.classList.add("reveal-js");

        // محاسبه تأخیر ورود؛ کارت‌های هم‌ردیف پشت سر هم ظاهر می‌شوند
        function getRevealDelay(element) {

            if (element.dataset.reveal !== "card") return 0;

            const grid = element.parentElement;

            const columns = window
                .getComputedStyle(grid)
                .gridTemplateColumns
                .split(" ")
                .length;

            const index = Array.prototype.indexOf.call(grid.children, element);

            return (index % columns) * 110;
        }

        function revealElement(element) {

            if (element.classList.contains("is-visible")) return;

            element.style.setProperty("--d", `${getRevealDelay(element)}ms`);
            element.classList.add("is-visible");
        }

        if ("IntersectionObserver" in window && !prefersReducedMotion) {

            // در صفحه‌های بلند (مثل تبلت عمودی) ممکن است بخش بعدی بدون اسکرول
            // در دید باشد. تا زمانی که کاربر اسکرول نکرده، چیزی نمایش داده نمی‌شود.
            let userHasScrolled = window.scrollY > 0;
            const waitingForScroll = new Set();

            window.addEventListener(
                "scroll",
                () => {
                    if (userHasScrolled || window.scrollY <= 0) return;

                    userHasScrolled = true;

                    waitingForScroll.forEach(element => {
                        revealElement(element);
                        revealObserver.unobserve(element);
                    });

                    waitingForScroll.clear();
                },
                { passive: true }
            );

            const revealObserver = new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        // عنصری که کاربر از آن رد شده (بالاتر از صفحه است) هم نمایش داده می‌شود
                        const alreadyPassed = entry.boundingClientRect.top < 0;

                        if (!entry.isIntersecting && !alreadyPassed) return;

                        if (!userHasScrolled) {
                            waitingForScroll.add(entry.target);
                            return;
                        }

                        revealElement(entry.target);
                        observer.unobserve(entry.target);

                    });

                },
                {
                    threshold: 0.12,

                    // عنصر وقتی نمایش داده می‌شود که کمی داخل صفحه آمده باشد،
                    // نه همین که لبه پایین صفحه را لمس کند.
                    rootMargin: "0px 0px -12% 0px"
                }
            );

            revealItems.forEach(item => revealObserver.observe(item));

        } else {

            // مرورگرهای قدیمی یا کاربران با تنظیم کاهش حرکت
            revealItems.forEach(revealElement);
        }
    }


    // =========================================================
    // 7. افکت نور دنبال‌کننده موس روی کارت‌های مهارت
    // ---------------------------------------------------------
    // فقط روی دستگاه‌های دارای موس فعال است (در لمسی اجرا نمی‌شود).
    // =========================================================

    const skillCards = document.querySelectorAll("#skills .skill-card");

    const supportsMouse = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    if (skillCards.length > 0 && supportsMouse) {

        skillCards.forEach(card => {

            // حرکت موس روی کارت
            card.addEventListener("pointermove", event => {

                const rect = card.getBoundingClientRect();

                // ارسال مختصات موس به متغیرهای CSS
                card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
                card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);

            });

            // بازگرداندن نور به مرکز کارت
            card.addEventListener("pointerleave", () => {

                card.style.setProperty("--mouse-x", "50%");
                card.style.setProperty("--mouse-y", "50%");

            });

        });
    }


    // =========================================================
    // 8. لوگوهای خارجی ابزارها (Adobe)
    // ---------------------------------------------------------
    // اگر فایل یک لوگو بارگذاری نشود، قاب خالی نمایش داده نمی‌شود و فقط نام ابزار می‌ماند.
    // =========================================================

    document.querySelectorAll("#tools .logo-mask[data-logo]").forEach(mask => {

        const probe = new Image();

        probe.addEventListener("error", () => {
            mask.closest(".tool-logo")?.classList.add("is-broken");
        });

        probe.src = mask.dataset.logo;
    });


    // (بخش ۱۱ قبلی حذف شد: به انیمیشنی اشاره می‌کرد که در پروژه وجود ندارد و هنگام تغییر تب خطا می‌داد.)

});


// ============================================================
// CONTENT PROTECTION | محدود کردن کپی معمولی
// ============================================================

// جلوگیری از کپی با Ctrl+C و Cmd+C
document.addEventListener("copy", function (event) {
    // فیلدهای فرم و عناصر دارای data-allow-copy (مثل شماره پیگیری) مستثنی هستند.
    if (event.target.closest && event.target.closest("input, textarea, [data-allow-copy]")) return;
    event.preventDefault();
});

// جلوگیری از برش متن با Ctrl+X و Cmd+X
document.addEventListener("cut", function (event) {
    if (event.target.closest && event.target.closest("input, textarea, [data-allow-copy]")) return;
    event.preventDefault();
});