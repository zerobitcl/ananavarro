(() => {
  "use strict";

  const WA_NUMBER = "56922595879";
  const EMAIL = "ana.navarro.v01@gmail.com";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------------------------------------------------
     Sticky header state
     -------------------------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* --------------------------------------------------------------------------
     Mobile navigation
     -------------------------------------------------------------------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("nav-principal");

  const closeNav = () => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú de navegación");
    siteNav.classList.remove("is-open");
  };

  const openNav = () => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menú de navegación");
    siteNav.classList.add("is-open");
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  /* --------------------------------------------------------------------------
     Active nav link on scroll
     -------------------------------------------------------------------------- */
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-list a")];

  const setActiveLink = () => {
    const offset = window.scrollY + 120;
    let currentId = "";

    for (const section of sections) {
      if (section.offsetTop <= offset) {
        currentId = section.id;
      }
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isActive = href === `#${currentId}`;
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  setActiveLink();
  window.addEventListener("scroll", setActiveLink, { passive: true });

  /* --------------------------------------------------------------------------
     Smooth scroll for same-page anchors (reduced-motion safe)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      if (history.pushState) {
        history.pushState(null, "", href);
      }
    });
  });

  /* --------------------------------------------------------------------------
     Reveal on scroll
     -------------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* --------------------------------------------------------------------------
     Pre-consulta form → WhatsApp / Email
     -------------------------------------------------------------------------- */
  const form = document.getElementById("preconsulta-form");
  const nameInput = document.getElementById("nombre");
  const matterSelect = document.getElementById("materia");
  const summaryInput = document.getElementById("resumen");
  const emailBtn = document.getElementById("btn-email");
  const statusEl = document.getElementById("form-status");
  const nameError = document.getElementById("nombre-error");
  const matterError = document.getElementById("materia-error");

  const getUrgency = () => {
    const checked = form?.querySelector('input[name="urgencia"]:checked');
    return checked ? checked.value : "Consulta preventiva";
  };

  const buildMessage = () => {
    const name = (nameInput?.value || "").trim();
    const matter = matterSelect?.value || "";
    const urgency = getUrgency();
    const summary = (summaryInput?.value || "").trim();

    let message =
      `Hola Ana, soy ${name}.\n` +
      `Quisiera una consulta sobre: ${matter}.\n` +
      `Urgencia: ${urgency}.`;

    if (summary) {
      message += `\nResumen: ${summary}`;
    }

    message += "\n¿Podemos coordinar una reunión?";
    return message;
  };

  const validateForm = () => {
    let valid = true;
    const name = (nameInput?.value || "").trim();
    const matter = matterSelect?.value || "";

    if (nameError) nameError.hidden = true;
    if (matterError) matterError.hidden = true;
    nameInput?.removeAttribute("aria-invalid");
    matterSelect?.removeAttribute("aria-invalid");

    if (!name) {
      valid = false;
      if (nameError) nameError.hidden = false;
      nameInput?.setAttribute("aria-invalid", "true");
    }

    if (!matter) {
      valid = false;
      if (matterError) matterError.hidden = false;
      matterSelect?.setAttribute("aria-invalid", "true");
    }

    return valid;
  };

  const openWhatsApp = () => {
    if (!validateForm()) {
      if (statusEl) statusEl.textContent = "Completa los campos obligatorios para continuar.";
      nameInput?.focus();
      return;
    }

    const message = buildMessage();
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    if (statusEl) statusEl.textContent = "Abriendo WhatsApp con tu consulta…";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openEmail = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      if (statusEl) statusEl.textContent = "Completa los campos obligatorios para continuar.";
      nameInput?.focus();
      return;
    }

    const name = (nameInput?.value || "").trim();
    const matter = matterSelect?.value || "";
    const subject = `Consulta legal — ${matter} — ${name}`;
    const body = buildMessage();
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (statusEl) statusEl.textContent = "Abriendo tu correo con el mensaje listo…";
    window.location.href = mailto;
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openWhatsApp();
    });
  }

  if (emailBtn) {
    emailBtn.addEventListener("click", openEmail);
  }

  /* --------------------------------------------------------------------------
     Area cards → preselect matter + scroll to form
     -------------------------------------------------------------------------- */
  document.querySelectorAll(".area-cta").forEach((button) => {
    button.addEventListener("click", () => {
      const area = button.getAttribute("data-area");
      if (matterSelect && area) {
        const optionExists = [...matterSelect.options].some((opt) => opt.value === area);
        if (optionExists) matterSelect.value = area;
      }

      const contact = document.getElementById("contacto");
      if (contact) {
        contact.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }

      if (nameInput) {
        window.setTimeout(() => nameInput.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 450);
      }

      if (statusEl && area) {
        statusEl.textContent = `Área preseleccionada: ${area}. Completa tu nombre y envía la consulta.`;
      }
    });
  });
})();
