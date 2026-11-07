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
            open ? "بستن منو" : "باز کردن منو"
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
                    ? "تغییر به حالت روز"
                    : "تغییر به حالت شب"
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

    // ⛔⛔⛔⛔⛔⛔⛔


    // =========================================================
    // 6. مدیریت بخش مهارت‌ها (Skills Section)
    // ---------------------------------------------------------
    // امکانات:
    // 1. نمایش کارت‌ها هنگام ورود به صفحه
    // 2. پر شدن نوار پیشرفت با مقدار data-level
    // 3. افکت نور دنبال‌کننده موس
    // 4. پشتیبانی از دستگاه‌های لمسی
    // =========================================================

    const skillCards = document.querySelectorAll("#skills .skill-card");

    // اگر کارت مهارتی در صفحه وجود نداشت، این بخش اجرا نمی‌شود.
    if (skillCards.length > 0) {

        // فعال کردن کلاس مخصوص انیمیشن‌های مهارت‌ها
        document.documentElement.classList.add("skills-js");

        // بررسی تنظیمات کاهش حرکت کاربر
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


        // -----------------------------------------------------
        // 6.1. تابع نمایش کارت و فعال‌سازی نوار درصد
        // -----------------------------------------------------

        function showSkillCard(card) {

            // جلوگیری از اجرای دوباره انیمیشن برای یک کارت
            if (card.classList.contains("is-visible")) return;

            // نمایش کارت
            card.classList.add("is-visible");

        }


        // -----------------------------------------------------
        // 6.2. نمایش کارت‌ها هنگام رسیدن به محدوده دید
        // -----------------------------------------------------

        if ("IntersectionObserver" in window && !prefersReducedMotion) {

            const skillsObserver = new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            // نمایش کارت و شروع پر شدن نوار
                            showSkillCard(entry.target);

                            // توقف بررسی کارتی که نمایش داده شده
                            observer.unobserve(entry.target);

                        }

                    });

                },
                {
                    threshold: 0.15,
                    rootMargin: "0px 0px -25px 0px"
                }
            );


            // اتصال Observer به تمام کارت‌ها
            skillCards.forEach(card => {
                skillsObserver.observe(card);
            });

        } else {

            // مرورگرهای قدیمی یا کاربران با تنظیم کاهش حرکت
            skillCards.forEach(showSkillCard);

        }


        // -----------------------------------------------------
        // 6.3. افکت نور دنبال‌کننده موس
        // -----------------------------------------------------

        const supportsMouse = window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        ).matches;


        if (supportsMouse) {

            skillCards.forEach(card => {

                // حرکت موس روی کارت
                card.addEventListener("pointermove", event => {

                    const rect = card.getBoundingClientRect();

                    // مختصات افقی موس داخل کارت
                    const mouseX = event.clientX - rect.left;

                    // مختصات عمودی موس داخل کارت
                    const mouseY = event.clientY - rect.top;

                    // ارسال مختصات به متغیرهای CSS
                    card.style.setProperty("--mouse-x", `${mouseX}px`);
                    card.style.setProperty("--mouse-y", `${mouseY}px`);

                });


                // بازگرداندن نور به مرکز کارت
                card.addEventListener("pointerleave", () => {

                    card.style.setProperty("--mouse-x", "50%");
                    card.style.setProperty("--mouse-y", "50%");

                });

            });

        }

    }


    // ⛔⛔⛔⛔⛔⛔⛔


    /* =========================================
   نمایش کل سکشن مهارت‌ها هنگام اسکرول
========================================= */

const skillsSection = document.querySelector("#skills");
const skillsContainer = skillsSection?.querySelector(".skills-container");
const skillsTrigger = skillsSection?.querySelector(".skills-details");

if (skillsContainer && skillsTrigger) {

    const skillsObserver = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                // نمایش عنوان، توضیحات و تمام محتوای بخش مهارت‌ها
                skillsContainer.classList.add("is-visible");

                // چون فقط یک بار قرار است نمایش داده شود، مشاهده را متوقف می‌کنیم
                skillsObserver.unobserve(entry.target);
            }

        });

    }, {
        threshold: 0.1,

        // محدوده فعال شدن را کمی پایین‌تر می‌آوریم تا با بارگذاری صفحه
        // بخش مهارت‌ها بلافاصله ظاهر نشود.
        rootMargin: "0px 0px -35% 0px"
    });

    skillsObserver.observe(skillsTrigger);
}



    // =========================================================
    // 11. مدیریت مخفی شدن تب مرورگر
    // =========================================================

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            return;
        }

        if (!reducedMotion && animationFrame === null) {
            animateCloud();
        }

    });

});


// ============================================================
// CONTENT PROTECTION | محدود کردن کپی معمولی
// ============================================================

// جلوگیری از کپی با Ctrl+C و Cmd+C
document.addEventListener("copy", function (event) {
    event.preventDefault();
});

// جلوگیری از برش متن با Ctrl+X و Cmd+X
document.addEventListener("cut", function (event) {
    event.preventDefault();
});