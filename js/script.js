// Utilidade para selecionar elementos
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

// Cabeçalho fixo com mudança de fundo ao scroll
function setupHeaderScroll() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const toggleHeader = () => {
    if (window.scrollY > 40) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }
  };

  toggleHeader();
  window.addEventListener("scroll", toggleHeader, { passive: true });
}

// Menu mobile
function setupMobileMenu() {
  const toggleBtn = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = menu.getAttribute("data-open") === "true";
    menu.setAttribute("data-open", String(!isOpen));
    menu.classList.toggle("translate-y-0");
    menu.classList.toggle("-translate-y-4");
    menu.classList.toggle("opacity-100");
    menu.classList.toggle("pointer-events-auto");
  });

  // Fechar ao clicar em um link
  $$("a[data-scroll]", menu).forEach((link) => {
    link.addEventListener("click", () => {
      menu.setAttribute("data-open", "false");
      menu.classList.add("-translate-y-4", "opacity-0", "pointer-events-none");
      menu.classList.remove(
        "translate-y-0",
        "opacity-100",
        "pointer-events-auto",
      );
    });
  });
}

// Scroll suave via JS (para ter controle fino se precisar)
function setupSmoothScroll() {
  $$("a[data-scroll]").forEach((link) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;

    link.addEventListener("click", (e) => {
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const headerOffset = 80;
      const rect = targetEl.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset - headerOffset;

      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    });
  });
}

// Fade-in ao scroll com IntersectionObserver
function setupScrollAnimations() {
  const elements = $$(".fade-in");
  if (!("IntersectionObserver" in window) || elements.length === 0) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    },
  );

  elements.forEach((el) => observer.observe(el));
}

// Parallax leve na hero
function setupHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const update = () => {
    const scrolled = window.pageYOffset;
    const offset = scrolled * 0.35;
    hero.style.backgroundPositionY = `${-offset}px`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

// Carrossel de momentos
function setupMomentosCarousel() {
  const carousel = $(".momentos-carousel");
  if (!carousel) return;

  const track = $(".momentos-track", carousel);
  const slides = $$(".momento-slide", track);
  const prevBtn = $(".carousel-btn--prev", carousel);
  const nextBtn = $(".carousel-btn--next", carousel);

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let slideWidth = slides[0].getBoundingClientRect().width;

  const updateSlideWidth = () => {
    slideWidth = slides[0].getBoundingClientRect().width;
    goTo(currentIndex, false);
  };

  const goTo = (index, animate = true) => {
    const maxIndex = slides.length - 1;
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    if (!animate) {
      track.style.transition = "none";
      requestAnimationFrame(() => {
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        // força reflow e volta transição
        void track.offsetWidth;
        track.style.transition = "";
      });
    } else {
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
  };

  nextBtn?.addEventListener("click", () => {
    goTo(currentIndex + 1);
  });

  prevBtn?.addEventListener("click", () => {
    goTo(currentIndex - 1);
  });

  window.addEventListener("resize", () => {
    updateSlideWidth();
  });

  // Suporte touch mobile
  let startX = 0;
  let isDragging = false;

  const onTouchStart = (e) => {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - startX;
    const offset = currentIndex * slideWidth - deltaX;
    track.style.transition = "none";
    track.style.transform = `translateX(-${offset}px)`;
  };

  const onTouchEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = endX - startX;
    const threshold = slideWidth * 0.18;

    track.style.transition = "";

    if (deltaX > threshold) {
      goTo(currentIndex - 1);
    } else if (deltaX < -threshold) {
      goTo(currentIndex + 1);
    } else {
      goTo(currentIndex);
    }
  };

  track.addEventListener("touchstart", onTouchStart, { passive: true });
  track.addEventListener("touchmove", onTouchMove, { passive: true });
  track.addEventListener("touchend", onTouchEnd);

  track.addEventListener("mousedown", onTouchStart);
  window.addEventListener("mousemove", onTouchMove);
  window.addEventListener("mouseup", onTouchEnd);

  goTo(0, false);
}

// Inicialização
window.addEventListener("DOMContentLoaded", () => {
  setupHeaderScroll();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollAnimations();
  setupHeroParallax();
  setupMomentosCarousel();

  const yearEl = document.getElementById("anoAtual");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
});
