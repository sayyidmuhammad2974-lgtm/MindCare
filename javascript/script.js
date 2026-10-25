// 1. Fungsi Navigasi SPA (Single Page Application)
function switchView(viewName) {
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('[data-view]').forEach((el) => {
            el.classList.toggle('active', el.dataset.view === viewName);
            if (el.dataset.view === viewName) el.setAttribute('aria-current', 'page');
            else el.removeAttribute('aria-current');
        });
        targetView.classList.add('active');
    }

    initTextReveal();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initPageNavigation() {
    const currentPage = document.querySelector('main[data-page]')?.dataset.page;
    if (!currentPage) return;

    document.querySelectorAll('[data-nav]').forEach((link) => {
        const isCurrent = link.dataset.nav === currentPage;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        const isOpen = !menu.classList.toggle('hidden');
        document.getElementById('mobile-menu-toggle')?.setAttribute('aria-expanded', String(isOpen));
    }
}

// Pilihan tema: mengikuti perangkat, terang, atau gelap.
function initThemePicker() {
    const button = document.getElementById('theme-toggle');
    const label = document.getElementById('theme-label');
    const icon = document.getElementById('theme-icon');
    if (!button) return;

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const modes = {
        system: { label: 'Perangkat', icon: 'fa-desktop' },
        light: { label: 'Terang', icon: 'fa-sun' },
        dark: { label: 'Gelap', icon: 'fa-moon' }
    };
    const nextMode = { system: 'light', light: 'dark', dark: 'system' };
    let preference = localStorage.getItem('mindcare-theme') || 'system';

    function applyTheme() {
        const theme = preference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : preference;
        const mode = modes[preference] || modes.system;
        document.documentElement.dataset.theme = theme;
        if (label) label.textContent = mode.label;
        if (icon) icon.className = `fa-solid ${mode.icon}`;
        button.setAttribute('aria-label', `Mode tampilan: ${mode.label}. Klik untuk mengganti.`);
        button.title = `Mode tampilan: ${mode.label}`;
    }

    applyTheme();
    button.addEventListener('click', () => {
        preference = nextMode[preference] || 'system';
        localStorage.setItem('mindcare-theme', preference);
        applyTheme();
    });
    systemTheme.addEventListener?.('change', () => {
        if (preference === 'system') applyTheme();
    });
}

function initInfiniteMarquee() {
    const tracks = [...document.querySelectorAll('.marquee-track:not([data-single-marquee])')];
    const setMarqueeSpeed = () => tracks.forEach((track) => {
        const firstGroup = track.querySelector('.marquee-group');
        const travelDistance = firstGroup ? firstGroup.getBoundingClientRect().width : track.scrollWidth / 2;
        if (travelDistance > 0) track.style.animationDuration = `${travelDistance / 11}s`;
    });

    tracks.forEach((track) => {
        if (!track.querySelector('.marquee-group')) {
            const original = track.innerHTML;
            track.innerHTML = `<div class="marquee-group">${original}</div><div class="marquee-group" aria-hidden="true">${original}</div>`;
        }
    });
    setMarqueeSpeed();
    window.addEventListener('resize', setMarqueeSpeed, { passive: true });
    document.fonts?.ready.then(setMarqueeSpeed);
}

let textRevealObserver;
function initTextReveal() {
    const targets = document.querySelectorAll('main h1, main h2, main h3, main p, footer h3, footer p');
    if (!('IntersectionObserver' in window)) {
        targets.forEach((element) => element.classList.add('is-revealed'));
        return;
    }

    if (!textRevealObserver) {
        textRevealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
    }

    targets.forEach((element) => {
        if (element.dataset.revealObserved) return;
        element.dataset.revealObserved = 'true';
        element.classList.add('text-reveal');
        textRevealObserver.observe(element);
    });
}

// 2. Event Listener Scroll Header Navigasi
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (header) {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// 3. Logika AI Chat & Safety Check
function startChatSession() {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    chatBox.className = 'flex-1 p-3 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 bg-slate-50/30';
    chatBox.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl brand-blue-bg text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                AI
            </div>
            <div class="bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[90%] sm:max-w-[75%] text-xs sm:text-sm leading-relaxed shadow-xs">
                Terima kasih sudah mengonfirmasi. Aku di sini untuk mendengarkan semua cerita, keluh kesah, atau tekanan yang sedang kamu rasakan secara 100% rahasia dan anonim. Apa yang sedang membebani pikiranmu hari ini?
            </div>
        </div>
    `;
}

function resetChat() {
    const chatBox = document.getElementById('chat-box');
    const inputField = document.getElementById('chat-input');

    if (inputField) inputField.value = '';
    if (!chatBox) return;

    chatBox.className = 'flex-1 p-3 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4';
    chatBox.innerHTML = `
        <div class="my-auto py-4 max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm text-center space-y-4 mx-auto">
            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl brand-red-bg text-white flex items-center justify-center text-xl sm:text-2xl mx-auto shadow-md">
                <i class="fa-solid fa-shield-heart"></i>
            </div>

            <div class="space-y-1.5">
                <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">Pemeriksaan Keselamatan</h2>
                <p class="text-xs text-slate-600 leading-relaxed">
                    Halo! Sebelum kita mengobrol, MindCare ingin memastikan kamu dalam kondisi aman.
                </p>
            </div>

            <p class="text-xs font-bold text-slate-800 pt-1">
                Apakah saat ini kamu memerlukan bantuan darurat?
            </p>

            <div class="space-y-2 pt-1">
                <button onclick="window.location.href='rujukan.html'" class="w-full py-3 px-3.5 brand-red-bg hover:opacity-90 text-white font-bold text-xs rounded-xl sm:rounded-2xl shadow-sm transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-phone-volume"></i>
                    <span>Hubungi Bantuan / Guru BK</span>
                </button>
                <button onclick="startChatSession()" class="w-full py-3 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-seedling text-emerald-500"></i>
                    <span>Tidak, Saya Aman & Ingin Curhat</span>
                </button>
            </div>
        </div>
    `;
}

function handleSendChat() {
    const inputField = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');

    if (!inputField || !chatBox) return;
    const message = inputField.value.trim();
    if (!message) return;

    // Jika pesan dikirim saat tampilan awal (Safety Card), ganti langsung ke percakapan
    if (chatBox.querySelector('.fa-shield-heart')) {
        chatBox.className = 'flex-1 p-3 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 bg-slate-50/30';
        chatBox.innerHTML = '';
    }

    // Tambah Bubble User
    const userBubble = document.createElement('div');
    userBubble.className = 'flex items-start justify-end gap-3';
    userBubble.innerHTML = `
        <div class="brand-blue-bg text-white p-3.5 sm:p-4 rounded-2xl rounded-tr-none max-w-[90%] sm:max-w-[75%] text-xs sm:text-sm leading-relaxed shadow-xs font-medium">
            ${escapeHtml(message)}
        </div>
    `;
    chatBox.appendChild(userBubble);
    inputField.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // Tambah Respons AI Otomatis (Simulasi)
    setTimeout(() => {
        const aiBubble = document.createElement('div');
        aiBubble.className = 'flex items-start gap-3';
        aiBubble.innerHTML = `
            <div class="w-8 h-8 rounded-xl brand-blue-bg text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                AI
            </div>
            <div class="bg-white border border-slate-200 text-slate-800 p-3.5 sm:p-4 rounded-2xl rounded-tl-none max-w-[90%] sm:max-w-[75%] text-xs sm:text-sm leading-relaxed shadow-xs">
                Terima kasih sudah berbagi denganku. Wajar banget kalau kamu merasa begitu. Luapkan aja semuanya, aku di sini siap mendengarkan.
            </div>
        `;
        chatBox.appendChild(aiBubble);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 600);
}

function sendQuickPrompt(promptText) {
    const inputField = document.getElementById('chat-input');
    if (inputField) {
        inputField.value = promptText;
        handleSendChat();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

function initQuiz() {
    const form = document.getElementById('quiz-form');
    if (!form) return;

    const questions = [...form.querySelectorAll('.quiz-q')];
    const progress = document.getElementById('quiz-progress-bar');
    const error = document.getElementById('quiz-error');
    const previous = document.getElementById('quiz-prev');
    const next = document.getElementById('quiz-next');
    const submit = document.getElementById('quiz-submit');
    const result = document.getElementById('quiz-result');
    if (!questions.length || !progress || !error || !previous || !next || !submit || !result) return;

    let current = 0;
    const showQuestion = () => {
        questions.forEach((question, index) => question.classList.toggle('hidden', index !== current));
        progress.style.width = `${((current + 1) / questions.length) * 100}%`;
        progress.setAttribute('aria-valuenow', String(current + 1));
        previous.classList.toggle('hidden', current === 0);
        next.classList.toggle('hidden', current === questions.length - 1);
        submit.classList.toggle('hidden', current !== questions.length - 1);
        error.classList.add('hidden');
    };
    const hasAnswer = () => Boolean(form.querySelector(`input[name="q${current + 1}"]:checked`));

    next.addEventListener('click', () => {
        if (!hasAnswer()) {
            error.classList.remove('hidden');
            return;
        }
        current += 1;
        showQuestion();
    });
    previous.addEventListener('click', () => {
        current = Math.max(0, current - 1);
        showQuestion();
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!hasAnswer()) {
            error.classList.remove('hidden');
            return;
        }

        const oftenCount = questions.reduce((total, _, index) => {
            const answer = form.querySelector(`input[name="q${index + 1}"]:checked`);
            return total + (Number(answer?.value || 0) >= 2 ? 1 : 0);
        }, 0);
        result.textContent = oftenCount
            ? `Kamu menandai ${oftenCount} dari ${questions.length} pengalaman sebagai hal yang cukup sering terjadi. Jika ini terasa berat, berbagi dengan orang yang kamu percaya bisa membantu. Ini refleksi pribadi, bukan penilaian klinis atau diagnosis.`
            : 'Dari jawabanmu, tidak ada pengalaman yang kamu tandai sering terjadi. Kamu tetap boleh mencari dukungan kapan pun membutuhkannya. Ini refleksi pribadi, bukan penilaian klinis atau diagnosis.';
        result.classList.remove('hidden');
        submit.disabled = true;
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    showQuestion();
}

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

// Inisialisasi awal saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    initPageNavigation();
    initThemePicker();
    initInfiniteMarquee();
    initTextReveal();
    initWaveText();
    initScrollReveal();
    initQuiz();
    switchView('landing');
});

function handleNavClick(event, url) {
    event.preventDefault(); // Tahan dulu perpindahan halaman
    const btn = event.currentTarget;
    const iconBox = btn.querySelector('.icon-box');
    const label = btn.querySelector('.nav-label');

    // 1. Ubah warna latar tombol utama jadi Biru MindCare (#4FBAEA)
    btn.style.backgroundColor = '#4FBAEA';
    btn.style.color = '#FFFFFF';

    // 2. Ubah icon box jadi latar putih dengan ikon/teks biru agar kontras & jelas
    if (iconBox) {
        iconBox.style.backgroundColor = '#FFFFFF';
        iconBox.style.color = '#4FBAEA';
        iconBox.style.borderColor = '#FFFFFF';
    }

    if (label) {
        label.style.color = '#FFFFFF';
    }

    // 3. Jeda 200ms supaya animasi tombol berwarna biru terlihat jelas oleh mata sebelum berpindah
    setTimeout(() => {
        window.location.href = url;
    }, 200);
}