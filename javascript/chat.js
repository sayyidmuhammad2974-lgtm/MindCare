document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-box');
    const submit = document.getElementById('chat-submit');
    const reset = document.getElementById('chat-reset');
    const historyList = document.getElementById('chat-history-list');
    const historyEmpty = document.getElementById('chat-history-empty');
    if (!form || !input || !box || !submit) return;

    const storageKey = 'mindcare-chat-history-v1';
    const maxHistoryCount = 20;
    const messages = [];
    let activeConversationId = createConversationId();
    let referralIndexes = new Set();
    let conversations = loadConversations();

    function createConversationId() {
        return globalThis.crypto?.randomUUID?.() || `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function loadConversations() {
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!Array.isArray(stored)) return [];
            return stored.filter((item) => item && typeof item.id === 'string' && Array.isArray(item.messages));
        } catch {
            return [];
        }
    }

    function saveConversation() {
        if (!messages.length) {
            conversations = conversations.filter((item) => item.id !== activeConversationId);
            writeHistory();
            return;
        }

        const firstUserMessage = messages.find((message) => message.role === 'user')?.content || 'Percakapan baru';
        const conversation = {
            id: activeConversationId,
            title: firstUserMessage.replace(/\s+/g, ' ').trim().slice(0, 52),
            updatedAt: Date.now(),
            messages: messages.map(({ role, content }) => ({ role, content })),
            referralIndexes: [...referralIndexes],
        };
        conversations = [conversation, ...conversations.filter((item) => item.id !== activeConversationId)]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, maxHistoryCount);
        writeHistory();
    }

    function writeHistory() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(conversations));
        } catch {
            // Keep the active chat working if browser storage is unavailable or full.
        }
        renderHistory();
    }

    function appendReferralLink(bubble) {
        const referral = document.createElement('a');
        referral.href = 'rujukan.html';
        referral.className = 'inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';
        referral.textContent = 'Hubungi guru BK / lihat rujukan';
        bubble.appendChild(referral);
    }

    function appendMessage(text, role, showReferral = false) {
        const row = document.createElement('div');
        row.className = role === 'user'
            ? 'chat-message flex w-full justify-end'
            : 'chat-message flex w-full justify-start';

        if (role === 'user') {
            const bubble = document.createElement('p');
            bubble.className = 'chat-bubble chat-bubble-user max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-br-md border border-sky-700 bg-sky-700 px-4 py-3 text-sm leading-relaxed text-white shadow-sm whitespace-pre-wrap break-words';
            bubble.textContent = text;
            row.appendChild(bubble);
        } else {
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm whitespace-pre-wrap break-words';
            const messageText = document.createElement('p');
            messageText.textContent = text;
            bubble.appendChild(messageText);
            if (showReferral) appendReferralLink(bubble);
            row.appendChild(bubble);
        }

        box.appendChild(row);
        box.scrollTop = box.scrollHeight;
        return row;
    }

    function showTypingBubble() {
        const row = document.createElement('div');
        row.id = 'chat-typing-indicator';
        row.className = 'chat-message flex w-full justify-start';
        row.setAttribute('role', 'status');
        row.setAttribute('aria-label', 'Sedang menyiapkan balasan');

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm inline-flex items-center gap-2';
        const dots = document.createElement('span');
        dots.className = 'chat-typing-dots';
        dots.setAttribute('aria-hidden', 'true');
        for (let index = 0; index < 3; index += 1) {
            const dot = document.createElement('span');
            dot.className = 'chat-typing-dot';
            dots.appendChild(dot);
        }
        bubble.appendChild(dots);
        row.appendChild(bubble);
        box.appendChild(row);
        box.scrollTop = box.scrollHeight;
    }

    function showFailureFeedback(failedMessage) {
        const row = document.createElement('div');
        row.className = 'chat-message flex w-full justify-start';

        const card = document.createElement('div');
        card.className = 'max-w-[88%] sm:max-w-[75%] rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm';
        const message = document.createElement('p');
        message.className = 'leading-relaxed';
        message.textContent = 'Layanan chat belum memberi balasan. Layanan AI mungkin sedang sibuk; coba lagi beberapa saat.';
        card.appendChild(message);

        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2';
        retry.innerHTML = '<i class="fa-solid fa-rotate-right" aria-hidden="true"></i><span>Coba lagi</span>';
        retry.addEventListener('click', () => {
            row.remove();
            messages.push({ role: 'user', content: failedMessage });
            saveConversation();
            sendMessageToAI();
        });
        card.appendChild(retry);

        row.appendChild(card);
        box.appendChild(row);
        box.scrollTop = box.scrollHeight;
    }

    function renderHistory() {
        if (!historyList || !historyEmpty) return;
        historyList.replaceChildren();
        const ordered = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
        historyEmpty.classList.toggle('hidden', ordered.length > 0);

        for (const conversation of ordered) {
            const item = document.createElement('div');
            item.className = 'flex items-center gap-2';

            const open = document.createElement('button');
            open.type = 'button';
            open.className = 'min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-sky-300 hover:bg-sky-50';
            const title = document.createElement('span');
            title.className = 'block truncate text-xs font-semibold text-slate-700';
            title.textContent = conversation.title || 'Percakapan';
            const date = document.createElement('span');
            date.className = 'mt-0.5 block text-[10px] text-slate-500';
            date.textContent = Number.isFinite(conversation.updatedAt)
                ? new Date(conversation.updatedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
                : '';
            open.append(title, date);
            open.addEventListener('click', () => {
                if (submit.disabled) return;
                restoreConversation(conversation);
            });

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'w-9 h-9 shrink-0 rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400';
            remove.setAttribute('aria-label', `Hapus riwayat ${conversation.title || 'percakapan'}`);
            remove.title = 'Hapus riwayat ini';
            remove.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
            remove.addEventListener('click', () => {
                if (submit.disabled) return;
                conversations = conversations.filter((itemConversation) => itemConversation.id !== conversation.id);
                if (activeConversationId === conversation.id) startNewConversation();
                writeHistory();
            });

            item.append(open, remove);
            historyList.appendChild(item);
        }
    }

    function restoreConversation(conversation) {
        messages.splice(0, messages.length, ...conversation.messages
            .filter((message) => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
            .map(({ role, content }) => ({ role, content })));
        activeConversationId = conversation.id;
        referralIndexes = new Set(Array.isArray(conversation.referralIndexes) ? conversation.referralIndexes : []);
        box.replaceChildren();
        messages.forEach((message, index) => {
            appendMessage(message.content, message.role, message.role === 'assistant' && referralIndexes.has(index));
        });
        box.scrollTop = box.scrollHeight;
    }

    function startNewConversation() {
        messages.length = 0;
        referralIndexes.clear();
        activeConversationId = createConversationId();
        box.replaceChildren();
        input.value = '';
        input.focus();
    }

    const sendMessageToAI = async () => {
        submit.disabled = true;
        if (reset) reset.disabled = true;
        showTypingBubble();

        let assistantRow = null;
        let assistantBubble = null;
        let assistantText = null;
        const renderStreamEvent = (event) => {
            if (event.type === 'replace') {
                document.getElementById('chat-typing-indicator')?.remove();
                assistantRow?.remove();
                assistantRow = appendMessage(event.text, 'assistant');
                assistantBubble = null;
                assistantText = null;
                return;
            }
            if (event.type !== 'delta') return;

            document.getElementById('chat-typing-indicator')?.remove();
            if (!assistantBubble) {
                assistantRow = document.createElement('div');
                assistantRow.className = 'chat-message flex w-full justify-start';
                assistantBubble = document.createElement('div');
                assistantBubble.className = 'chat-bubble max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm whitespace-pre-wrap break-words';
                assistantText = document.createElement('p');
                assistantBubble.appendChild(assistantText);
                assistantRow.appendChild(assistantBubble);
                box.appendChild(assistantRow);
            }
            assistantText.textContent += event.text;
            box.scrollTop = box.scrollHeight;
        };

        try {
            const result = await window.MindCareChatApi.send(messages, { onEvent: renderStreamEvent });
            document.getElementById('chat-typing-indicator')?.remove();
            messages.push({ role: 'assistant', content: result.reply });
            if (result.showReferral) referralIndexes.add(messages.length - 1);

            if (assistantRow) {
                if (result.showReferral) appendReferralLink(assistantBubble || assistantRow.querySelector('.chat-bubble'));
            } else {
                assistantRow = appendMessage(result.reply, 'assistant', result.showReferral);
            }
            saveConversation();
        } catch {
            document.getElementById('chat-typing-indicator')?.remove();
            assistantRow?.remove();
            const failedMessage = messages[messages.length - 1]?.role === 'user'
                ? messages[messages.length - 1].content
                : '';
            messages.pop();
            saveConversation();
            showFailureFeedback(failedMessage);
        } finally {
            submit.disabled = false;
            if (reset) reset.disabled = false;
            input.focus();
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text || submit.disabled) return;

        input.value = '';
        appendMessage(text, 'user');
        messages.push({ role: 'user', content: text });
        if (messages.length > 20) {
            const removeCount = Math.ceil((messages.length - 20) / 2) * 2;
            messages.splice(0, removeCount);
            referralIndexes = new Set([...referralIndexes]
                .filter((index) => index >= removeCount)
                .map((index) => index - removeCount));
        }
        saveConversation();
        await sendMessageToAI();
    });

    document.addEventListener('click', (event) => {
        if (!submit.disabled || !(event.target instanceof Element)) return;
        const link = event.target.closest('a[href]');
        if (!link) return;

        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
        event.preventDefault();
        window.open(destination.href, '_blank', 'noopener,noreferrer');
    });

    reset?.addEventListener('click', startNewConversation);

    document.querySelectorAll('[data-chat-prompt]').forEach((button) => {
        button.addEventListener('click', () => {
            input.value = button.dataset.chatPrompt;
            input.focus();
        });
    });

    renderHistory();
});
