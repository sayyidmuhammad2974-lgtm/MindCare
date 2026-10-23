// 1. Fungsi Navigasi SPA (Single Page Application)
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
                <button onclick="switchView('rujukan')" class="w-full py-3 px-3.5 brand-red-bg hover:opacity-90 text-white font-bold text-xs rounded-xl sm:rounded-2xl shadow-sm transition flex items-center justify-center gap-2">
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

// 4. Logika Kuis Skrining Bertahap
let currentStep = 1;
const totalSteps = 5;
let quizScore = 0;

function answerQuestion(score) {
    quizScore += score;
    
    const currentElem = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    if (currentElem) currentElem.classList.add('hidden');

    currentStep++;

    if (currentStep <= totalSteps) {
        const nextElem = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
        if (nextElem) nextElem.classList.remove('hidden');

        const progressBar = document.getElementById('quiz-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
        }
    } else {
        const progressContainer = document.getElementById('quiz-progress-container');
        if (progressContainer) progressContainer.classList.add('hidden');
        showQuizResult();
    }
}

function showQuizResult() {
    const resultElem = document.getElementById('quiz-result');
    const titleElem = document.getElementById('result-title');
    const descElem = document.getElementById('result-desc');

    if (!resultElem) return;
    resultElem.classList.remove('hidden');

    if (quizScore <= 3) {
        if (titleElem) titleElem.textContent = "Kondisi Emosional Stabil";
        if (descElem) descElem.textContent = "Beban emosionalmu saat ini tergolong aman. Tetap jaga kesehatan mental dan pola istirahatmu sehari-hari.";
    } else if (quizScore <= 6) {
        if (titleElem) titleElem.textContent = "Tingkat Kecemasan Ringan-Sedang";
        if (descElem) descElem.textContent = "Kamu sedang merasakan sedikit beban pikiran atau stres belajar. Cobalah melakukan relaksasi pernapasan atau luapkan perasaanmu di fitur AI Care Chat.";
    } else {
        if (titleElem) titleElem.textContent = "Membutuhkan Dukungan Emosional";
        if (descElem) descElem.textContent = "Tingkat stres atau kecemasanmu cukup tinggi saat ini. Sangat disarankan untuk berbagi cerita dengan AI Care Chat atau berkonsultasi secara tertutup dengan Guru BK di sekolah.";
    }
}

function resetQuiz() {
    currentStep = 1;
    quizScore = 0;

    const resultElem = document.getElementById('quiz-result');
    const progressContainer = document.getElementById('quiz-progress-container');
    const progressBar = document.getElementById('quiz-progress-bar');

    if (resultElem) resultElem.classList.add('hidden');
    if (progressContainer) progressContainer.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '20%';

    document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
    const stepOne = document.querySelector('.quiz-step[data-step="1"]');
    if (stepOne) stepOne.classList.remove('hidden');
}

// Inisialisasi awal saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    switchView('landing');
});