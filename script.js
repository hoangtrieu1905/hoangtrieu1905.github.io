// ===== Navbar =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  toggle.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
  });
});

// ===== Active nav link — current page =====
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ===== Reveal on scroll =====
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Fallback if IntersectionObserver is not supported
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  els.forEach(el => io.observe(el));
})();

// ===== Image placeholders =====
function imgFail(el, initials) {
  el.onerror = null;
  el.style.display = 'none';
  const ph = document.createElement('div');
  ph.className = 'img-placeholder';
  ph.style.cssText = 'font-family:var(--serif);font-size:3rem;font-weight:600;background:var(--accent);color:#fff;border-radius:50%;';
  ph.textContent = initials;
  el.parentNode.insertBefore(ph, el.nextSibling);
}

function imgFailCourse(el, icon, name) {
  el.onerror = null;
  el.style.display = 'none';
  const ph = document.createElement('div');
  ph.className = 'img-placeholder';
  ph.innerHTML = `
    <div class="ph-icon">${icon}</div>
    <div style="font-weight:600;font-size:.82rem;">${name}</div>
    <div class="ph-hint">Replace: assets/courses/${name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}.jpg</div>
  `;
  el.parentNode.insertBefore(ph, el.nextSibling);
}

function imgFailTravel(el, flag) {
  el.onerror = null;
  el.style.display = 'none';
  const ph = document.createElement('div');
  ph.className = 'img-placeholder';
  ph.innerHTML = `
    <div style="font-size:3rem;line-height:1;">${flag}</div>
    <div class="ph-hint">Add a photo here</div>
  `;
  el.parentNode.insertBefore(ph, el.nextSibling);
}

function imgFailLdr(el) {
  el.onerror = null;
  el.style.display = 'none';
  const ph = el.nextElementSibling;
  if (ph) {
    ph.style.display = 'flex';
  }
}

// ===== Travel galleries =====
(function () {
  document.querySelectorAll('.gallery-wrap').forEach(wrap => {
    const track = wrap.querySelector('.gallery-track');
    const prevBtn = wrap.querySelector('.gallery-arrow.prev');
    const nextBtn = wrap.querySelector('.gallery-arrow.next');
    const dotsContainer = wrap.querySelector('.gallery-dots');
    if (!track) return;

    const slides = track.querySelectorAll('.gallery-slide');
    const slideCount = slides.length;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
      dot.addEventListener('click', () => scrollToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.gallery-dot');

    function scrollToSlide(index) {
      const slide = slides[index];
      if (!slide) return;
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }

    function getActiveIndex() {
      const scrollLeft = track.scrollLeft;
      const slideWidth = slides[0] ? slides[0].offsetWidth + 14 : 1; // 14 = gap
      return Math.round(scrollLeft / slideWidth);
    }

    function updateUI() {
      const i = getActiveIndex();
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      if (prevBtn) prevBtn.disabled = i === 0;
      if (nextBtn) nextBtn.disabled = i >= slideCount - 1;
    }

    track.addEventListener('scroll', updateUI, { passive: true });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const i = Math.max(0, getActiveIndex() - 1);
        scrollToSlide(i);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const i = Math.min(slideCount - 1, getActiveIndex() + 1);
        scrollToSlide(i);
      });
    }

    // Initial state
    updateUI();
  });
})();

// ===== Thoughts "View more / View less" =====
(function () {
  document.querySelectorAll('[data-category]').forEach(category => {
    const overflow = category.querySelector('[data-overflow]');
    const btn = category.querySelector('[data-viewmore]');
    const countEl = btn ? btn.querySelector('[data-count]') : null;
    if (!overflow || !btn) return;

    // Count entries inside overflow
    const entries = overflow.querySelectorAll('.thought-entry, .resource-card');
    const count = entries.length;

    if (count === 0) {
      // Nothing hidden — hide the button entirely
      btn.parentElement.style.display = 'none';
      return;
    }

    // Show count badge
    if (countEl) countEl.textContent = `+${count}`;

    // Set initial max-height to 0
    overflow.style.maxHeight = '0px';

    let open = false;

    btn.addEventListener('click', () => {
      open = !open;
      if (open) {
        overflow.classList.remove('collapsed');
        overflow.style.maxHeight = overflow.scrollHeight + 'px';
        btn.classList.add('open');
        btn.childNodes[0].textContent = 'View less ';
        if (countEl) countEl.style.display = 'none';
      } else {
        overflow.style.maxHeight = '0px';
        btn.classList.remove('open');
        btn.childNodes[0].textContent = 'View more ';
        if (countEl) countEl.style.display = '';
        // Smooth scroll back up to section header when collapsing
        setTimeout(() => {
          category.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 460);
      }
    });
  });
})();

// ===== Mobile Navigation Dropdown Accordion =====
(function() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  const toggles = navLinks.querySelectorAll('.nav-arrow-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Find the closest parent list items
      const dropdownLi = btn.closest('.nav-dropdown');
      const submenuLi = btn.closest('.nav-submenu');

      if (submenuLi) {
        // This is a second-level toggle inside the dropdown menu
        submenuLi.classList.toggle('open-submenu');
        const submenuMenu = submenuLi.querySelector('.submenu-menu');
        if (submenuMenu) {
          submenuMenu.classList.toggle('open-menu');
        }
      } else if (dropdownLi) {
        // This is a first-level toggle in the main nav list
        dropdownLi.classList.toggle('open-dropdown');
        const dropdownMenu = dropdownLi.querySelector('.dropdown-menu');
        if (dropdownMenu) {
          dropdownMenu.classList.toggle('open-menu');
        }
      }
    });
  });
})();

// ===== Scroll Progress Bar =====
(function() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  }, { passive: true });
})();

