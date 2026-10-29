/*
 * MindCare API adapter.
 * This file talks only to the MindCare Node.js backend. Keep NVIDIA_API_KEY
 * in backend/.env; never put provider secrets in browser code.
 */
window.MINDCARE_CHAT_CONFIG = Object.freeze({
    endpoint: 'https://mindcare-chat-api.mikael-putra001.workers.dev/api/chat'
});

window.MindCareChatApi = {
    async send(messages, { signal, onEvent } = {}) {
        const config = window.MINDCARE_CHAT_CONFIG;
        if (!config.endpoint) {
            throw new Error('Alamat backend chat belum dikonfigurasi.');
        }

        const headers = {
            'Accept': 'text/event-stream, application/json',
            'Content-Type': 'application/json'
        };

        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers,
            signal,
            body: JSON.stringify({ messages })
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('text/event-stream')
            ? null
            : await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || `Permintaan chat gagal (${response.status}).`);
        }

        if (contentType.includes('text/event-stream')) {
            return readEventStream(response, onEvent);
        }

        const answer = data.reply;
        if (typeof answer !== 'string' || !answer.trim()) {
            throw new Error('Format jawaban API tidak dikenali. Sesuaikan chat-api.js dengan backend.');
        }
        onEvent?.({ type: 'delta', text: answer.trim() });
        return {
            reply: answer.trim(),
            showReferral: data.show_referral === true
        };
    }
};

async function readEventStream(response, onEvent) {
    if (!response.body) throw new Error('Sambungan streaming tidak tersedia di browser ini.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let reply = '';
    let showReferral = false;
    let completed = false;

    const handleEvent = (block) => {
        let eventName = 'message';
        const dataLines = [];
        for (const line of block.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
        }
        if (!dataLines.length) return;

        let payload;
        try {
            payload = JSON.parse(dataLines.join('\n'));
        } catch {
            return;
        }

        if (eventName === 'delta' && typeof payload.text === 'string') {
            reply += payload.text;
            onEvent?.({ type: 'delta', text: payload.text });
        } else if (eventName === 'replace' && typeof payload.text === 'string') {
            reply = payload.text;
            onEvent?.({ type: 'replace', text: payload.text });
        } else if (eventName === 'referral') {
            showReferral = payload.show_referral === true;
            onEvent?.({ type: 'referral', showReferral });
        } else if (eventName === 'error') {
            throw new Error(payload.message || 'Layanan chat gagal memproses pesan.');
        } else if (eventName === 'done') {
            showReferral = payload.show_referral === true || showReferral;
            completed = true;
        }
    };

    try {
        while (!completed) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
                handleEvent(buffer.slice(0, boundary));
                buffer = buffer.slice(boundary + 2);
                boundary = buffer.indexOf('\n\n');
            }
        }
        buffer += decoder.decode();
        if (buffer.trim()) handleEvent(buffer);
        if (!completed) throw new Error('Sambungan ke layanan chat terputus sebelum balasan selesai.');
    } finally {
        if (!completed) await reader.cancel().catch(() => {});
        reader.releaseLock();
    }

    if (!reply.trim()) throw new Error('Layanan AI mengirim jawaban kosong.');
    return { reply: reply.trim(), showReferral };
}
