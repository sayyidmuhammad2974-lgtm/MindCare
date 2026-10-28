function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    const targetNav = document.getElementById(`nav-${viewName}`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Event Listener saat Halaman di-Scroll ke Bawah
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ============================================
// Scroll Reveal: elemen muncul halus saat masuk viewport
// (mencakup .reveal biasa dan judul .reveal-wave)
// ============================================
function initScrollReveal() {
    const items = document.querySelectorAll('.reveal, .reveal-wave');

    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px'
    });

    items.forEach(el => observer.observe(el));
}

// ============================================
// Wave Text: memecah judul (.reveal-wave) per kata agar
// muncul bergelombang (efek mask-reveal) saat is-visible aktif
// ============================================
function wrapWaveWords(el, startIndex, baseDelay, stagger) {
    const nodes = Array.from(el.childNodes);
    let index = startIndex;
    const fragment = document.createDocumentFragment();

    nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const tokens = node.textContent.split(/(\s+)/);
            tokens.forEach(token => {
                if (token === '') return;
                if (/^\s+$/.test(token)) {
                    fragment.appendChild(document.createTextNode(token));
                } else {
                    const mask = document.createElement('span');
                    mask.className = 'word-mask';
                    const inner = document.createElement('span');
                    inner.className = 'word-inner';
                    inner.style.transitionDelay = (baseDelay + index * stagger).toFixed(3) + 's';
                    inner.textContent = token;
                    mask.appendChild(inner);
                    fragment.appendChild(mask);
                    index++;
                }
            });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const mask = document.createElement('span');
            mask.className = 'word-mask';
            const inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.style.transitionDelay = (baseDelay + index * stagger).toFixed(3) + 's';
            inner.appendChild(node);
            mask.appendChild(inner);
            fragment.appendChild(mask);
            index++;
        }
    });

    el.innerHTML = '';
    el.appendChild(fragment);
    return index;
}

function initWaveText() {
    document.querySelectorAll('.reveal-wave').forEach(el => {
        if (el.dataset.waved === 'true') return;
        const base = parseFloat(el.dataset.waveBase || '0');
        const stagger = parseFloat(el.dataset.waveStagger || '0.05');
        wrapWaveWords(el, 0, base, stagger);
        el.dataset.waved = 'true';
    });
}

// ============================================
// Modal Kontak BK: tampilkan dulu biodata/jadwal
// Guru BK sebelum benar-benar "menghubungi"
// ============================================
function toggleBkContact() {
    const modal = document.getElementById('bk-contact-modal');
    if (!modal) return;

    const willOpen = modal.classList.contains('hidden');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
    document.body.style.overflow = willOpen ? 'hidden' : '';
}

document.addEventListener('DOMContentLoaded', () => {
    switchView('landing');
    initWaveText();
    initScrollReveal();
});