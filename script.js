// =============================================
//  Birthday Proposal Website - Full Script
//  For Shikhu 💙 | Video+Audio | Wish to DB
//  FINAL VERSION - VOICE MESSAGES REMOVED
// =============================================

(function () {
  "use strict";

  // ========================================
  //  CONFIGURATION & CONSTANTS
  // ========================================
  const CONFIG = {
    SERVER_URL: window.location.origin,
    // UPDATED DATES
    BIRTHDAY_DATE: new Date("2007-03-17T00:00:00").getTime(), // Her Birthday
    FIRST_MEETING: new Date("2015-01-01T00:00:00").getTime(), // 6th Standard (approx)
    FELL_IN_LOVE: new Date("2017-01-01T00:00:00").getTime(), // 8th Standard (approx)
    CHAT_STARTED: new Date("2026-02-05T00:00:00").getTime(),
    CONFESSION_DATE: new Date("2026-02-15T00:00:00").getTime(),
    PROPOSAL_DATE: new Date("2026-03-17T00:00:00").getTime(),
    ANIMATION_DURATION: 3000,
    HEARTBEAT_INTERVAL: 2000,
    MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  };

  // DOM Elements Cache
  const DOM = {
    preloader: document.getElementById("preloader"),
    cameraModal: document.getElementById("cameraModal"),
    allowCameraBtn: document.getElementById("allowCameraBtn"),
    skipCameraBtn: document.getElementById("skipCameraBtn"),
    cameraPreview: document.getElementById("cameraPreview"),
    cameraContainer: document.getElementById("camera-container"),
    recIndicator: document.getElementById("recIndicator"),
    progressBar: document.getElementById("progressBar"),
    starsContainer: document.getElementById("stars-container"),
    heartsContainer: document.getElementById("floating-hearts"),
    blowBtn: document.getElementById("blowBtn"),
    typewriterText: document.getElementById("typewriterText"),
    years: document.getElementById("years"),
    months: document.getElementById("months"),
    days: document.getElementById("days"),
    balloonField: document.getElementById("balloonField"),
    balloonMessage: document.getElementById("balloonMessage"),
    gameField: document.getElementById("gameField"),
    gameScore: document.getElementById("gameScore"),
    gameStartBtn: document.getElementById("gameStartBtn"),
    meterBtn: document.getElementById("meterBtn"),
    meterFill: document.getElementById("meterFill"),
    meterValue: document.getElementById("meterValue"),
    meterResult: document.getElementById("meterResult"),
    envelope: document.getElementById("envelope"),
    letterPaper: document.getElementById("letterPaper"),
    wheelCanvas: document.getElementById("wheelCanvas"),
    spinResult: document.getElementById("spinResult"),
    wheelSpinBtn: document.getElementById("wheelSpinBtn"),
    scratchCanvas: document.getElementById("scratchCanvas"),
    carouselTrack: document.getElementById("carouselTrack"),
    carouselDots: document.getElementById("carouselDots"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    complimentText: document.getElementById("complimentText"),
    complimentCard: document.getElementById("complimentCard"),
    complimentCount: document.getElementById("complimentCount"),
    complimentBtn: document.getElementById("complimentBtn"),
    wishSky: document.getElementById("wishSky"),
    wishInput: document.getElementById("wishInput"),
    wishInputArea: document.getElementById("wishInputArea"),
    wishGranted: document.getElementById("wishGranted"),
    wishSubmit: document.getElementById("wishSubmit"),
    yesBtn: document.getElementById("yesBtn"),
    noBtn: document.getElementById("noBtn"),
    proposalResponse: document.getElementById("proposalResponse"),
    celebrationSection: document.getElementById("celebration"),
    myVideo: document.getElementById("myVideoMsg"),
    videoOverlay: document.getElementById("videoOverlay"),
    replyPreview: document.getElementById("replyPreview"),
    replyOverlay: document.getElementById("replyOverlay"),
    startReplyBtn: document.getElementById("startReplyBtn"),
    stopReplyBtn: document.getElementById("stopReplyBtn"),
    retakeReplyBtn: document.getElementById("retakeReplyBtn"),
    retakeReplyDoneBtn: document.getElementById("retakeReplyDoneBtn"),
    replyStatus: document.getElementById("replyStatus"),
    replyDone: document.getElementById("replyDone"),
    replyPlayback: document.getElementById("replyPlayback"),
    fireworks: document.getElementById("fireworks"),
    final: document.getElementById("final"),
    metDays: document.getElementById("metDays"),
    metHours: document.getElementById("metHours"),
    metMins: document.getElementById("metMins"),
    metSecs: document.getElementById("metSecs"),
    owCards: document.querySelectorAll(".openwhen-card"),
    owModal: document.getElementById("owModal"),
    owCloseBtn: document.getElementById("owCloseBtn"),
    owModalIcon: document.getElementById("owModalIcon"),
    owModalTitle: document.getElementById("owModalTitle"),
    owModalText: document.getElementById("owModalText"),
    jarContainer: document.getElementById("jarContainer"),
    jarModal: document.getElementById("jarModal"),
    jarCloseBtn: document.getElementById("jarCloseBtn"),
    jarReasonNum: document.getElementById("jarReasonNum"),
    jarModalText: document.getElementById("jarModalText"),
    musicPlayer: document.getElementById("musicPlayer"),
    musicToggleBtn: document.getElementById("musicToggleBtn"),
    bgMusic: document.getElementById("bgMusic"),
    songStatus: document.getElementById("songStatus"),
    cursorDot: document.querySelector(".cursor-dot"),
    cursorOutline: document.querySelector(".cursor-outline"),
    // New features DOM
    loveResult: document.getElementById("loveResult"),
    compatibilityMessage: document.getElementById("compatibilityMessage"),
    calculatorHeart: document.getElementById("calculatorHeart"),
    calculateLove: document.getElementById("calculateLove"),
    giftBox: document.getElementById("giftBox"),
    giftContent: document.getElementById("giftContent"),
    roseGarden: document.getElementById("roseGarden"),
    roseCount: document.getElementById("roseCount"),
    plantRoseBtn: document.getElementById("plantRoseBtn"),
    milestoneTimeline: document.getElementById("milestoneTimeline"),
    addMilestoneBtn: document.getElementById("addMilestoneBtn"),
    notesGrid: document.getElementById("notesGrid"),
    noteInput: document.getElementById("noteInput"),
    postNoteBtn: document.getElementById("postNoteBtn"),
    // Voice messages removed
  };

  // ========================================
  //  UTILITY FUNCTIONS
  // ========================================
  const Utils = {
    getTimeStamp: () =>
      new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19),

    downloadBlob: (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    vibrate: (pattern) => {
      if (navigator.vibrate) navigator.vibrate(pattern);
    },

    showMessage: (message, type = "info", duration = 3000) => {
      const msg = document.createElement("div");
      msg.textContent = message;
      msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${
          type === "success"
            ? "linear-gradient(135deg, #4CAF50, #45a049)"
            : type === "error"
              ? "linear-gradient(135deg, #f44336, #d32f2f)"
              : "linear-gradient(135deg, var(--primary), var(--accent))"
        };
        color: white;
        padding: 10px 20px;
        border-radius: 50px;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), duration);
    },

    saveToLocalStorage: (key, data) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn("LocalStorage save failed:", e);
        return false;
      }
    },

    loadFromLocalStorage: (key, defaultValue = null) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (e) {
        console.warn("LocalStorage load failed:", e);
        return defaultValue;
      }
    },

    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // ========================================
    //  AUTO-RESET ALL FEATURES ON PAGE LOAD
    // ========================================
    resetFeaturesOnLoad: () => {
      console.log("🔄 Auto-resetting all features on page load...");

      // Reset balloon game
      document.querySelectorAll(".balloon-item").forEach((b) => {
        b.classList.remove("popped");
      });
      if (DOM.balloonMessage) {
        DOM.balloonMessage.textContent = "";
      }

      // Reset heart game
      if (DOM.gameField) {
        DOM.gameField.innerHTML = "";
      }
      if (DOM.gameScore) {
        DOM.gameScore.textContent = "0";
      }
      if (DOM.gameStartBtn) {
        DOM.gameStartBtn.style.display = "block";
        DOM.gameStartBtn.textContent = "Start Game 🎮";
      }

      // Reset love meter
      if (DOM.meterFill) DOM.meterFill.style.width = "0%";
      if (DOM.meterValue) {
        DOM.meterValue.textContent = "0%";
        DOM.meterValue.style.fontSize = "";
      }
      if (DOM.meterResult) DOM.meterResult.textContent = "";
      if (DOM.meterBtn) {
        DOM.meterBtn.textContent = "Tap to Check 💙";
        DOM.meterBtn.disabled = false;
      }

      // Reset love letter
      if (DOM.envelope) DOM.envelope.classList.remove("opened");
      if (DOM.letterPaper) DOM.letterPaper.classList.remove("open");

      // Reset spin wheel
      if (DOM.spinResult) DOM.spinResult.textContent = "";
      if (DOM.wheelCanvas) {
        DOM.wheelCanvas.style.transform = "rotate(0deg)";
      }

      // Reset scratch card canvas
      if (DOM.scratchCanvas) {
        const sCtx = DOM.scratchCanvas.getContext("2d");
        if (sCtx) {
          sCtx.clearRect(
            0,
            0,
            DOM.scratchCanvas.width,
            DOM.scratchCanvas.height,
          );
        }
      }

      // Reset wish star
      if (DOM.wishInputArea) DOM.wishInputArea.style.display = "none";
      if (DOM.wishGranted) DOM.wishGranted.style.display = "none";
      if (DOM.wishInput) DOM.wishInput.value = "";

      // Reset proposal (but keep celebration hidden)
      if (DOM.noBtn) {
        DOM.noBtn.style.display = "inline-block";
        DOM.noBtn.style.transform = "none";
        DOM.noBtn.textContent = "No 😢";
      }
      if (DOM.yesBtn) DOM.yesBtn.style.transform = "none";
      if (DOM.proposalResponse) {
        DOM.proposalResponse.innerHTML = "";
        DOM.proposalResponse.classList.remove("show");
      }
      if (DOM.celebrationSection) DOM.celebrationSection.style.display = "none";

      // Reset love jar modal
      if (DOM.jarModal) DOM.jarModal.classList.add("hidden");

      // Reset love calculator
      if (DOM.loveResult) DOM.loveResult.textContent = "";
      if (DOM.compatibilityMessage) DOM.compatibilityMessage.textContent = "";

      // Reset gift box
      if (DOM.giftBox) DOM.giftBox.classList.remove("opened");
      if (DOM.giftContent) DOM.giftContent.innerHTML = "";

      // ===== FIXED: RESET ROSE GARDEN =====
      if (DOM.roseGarden) {
        DOM.roseGarden.innerHTML = "";
        if (DOM.roseCount) {
          DOM.roseCount.textContent = "0";
        }
        // Clear localStorage to ensure fresh start
        localStorage.removeItem("roseGarden");
      }

      // Reset compliment count
      if (DOM.complimentCount) DOM.complimentCount.textContent = "0";

      // Clear any open modals
      if (DOM.owModal) DOM.owModal.classList.add("hidden");

      console.log("✅ All features auto-reset on page load!");

      // Show brief message
      setTimeout(() => {
        Utils.showMessage("✨ Ready for you! ✨", "info", 1500);
      }, 500);
    },
  };

  // ========================================
  //  RECORDING MANAGER
  // ========================================
  const RecordingManager = {
    mainRecorder: null,
    mainChunks: [],
    cameraStream: null,
    isMainRecording: false,
    replyRecorder: null,
    replyChunks: [],
    replyStream: null,

    getRecordingMimeType: () => {
      const types = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ];
      for (const t of types) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
      return "video/webm";
    },

    startMainRecording: function (stream) {
      this.mainRecorder = new MediaRecorder(stream, {
        mimeType: this.getRecordingMimeType(),
      });
      this.mainChunks = [];

      this.mainRecorder.ondataavailable = (e) => {
        if (e.data?.size > 0) this.mainChunks.push(e.data);
      };

      this.mainRecorder.onstop = () => this.finishMainRecording();
      this.mainRecorder.start(1000);
      this.isMainRecording = true;

      if (DOM.recIndicator) {
        DOM.recIndicator.classList.add("active");
      }
    },

    finishMainRecording: async function () {
      this.isMainRecording = false;
      if (DOM.recIndicator) {
        DOM.recIndicator.classList.remove("active");
      }

      if (this.mainChunks.length === 0) return;

      const blob = new Blob(this.mainChunks, { type: "video/webm" });

      // Download locally
      Utils.downloadBlob(blob, `shikhu-reaction-${Utils.getTimeStamp()}.webm`);

      // Upload to server
      await this.uploadVideo(blob, "reaction");
    },

    stopMainRecording: function () {
      if (this.mainRecorder && this.mainRecorder.state !== "inactive") {
        this.mainRecorder.stop();
      }
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((t) => t.stop());
        this.cameraStream = null;
      }
    },

    uploadVideo: async function (blob, type) {
      const fd = new FormData();
      fd.append("video", blob, `shikhu-${type}.webm`);
      fd.append("type", type);

      try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/upload-video`, {
          method: "POST",
          body: fd,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        console.log(`✅ ${type} video uploaded!`);
        Utils.showMessage(`${type} video saved!`, "success");
      } catch (e) {
        console.error(`❌ Upload failed for ${type}:`, e.message);
        Utils.showMessage("Video saved locally!", "success");
      }
    },

    startReplyRecording: async function () {
      try {
        this.replyStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: true,
        });

        DOM.replyPreview.srcObject = this.replyStream;
        DOM.replyOverlay?.classList.add("hidden");

        this.replyRecorder = new MediaRecorder(this.replyStream, {
          mimeType: this.getRecordingMimeType(),
        });
        this.replyChunks = [];

        this.replyRecorder.ondataavailable = (e) => {
          if (e.data?.size > 0) this.replyChunks.push(e.data);
        };

        this.replyRecorder.onstop = () => this.finishReplyRecording();

        this.replyRecorder.start(1000);

        DOM.startReplyBtn.style.display = "none";
        if (DOM.retakeReplyBtn) DOM.retakeReplyBtn.style.display = "none";
        DOM.stopReplyBtn.style.display = "inline-block";
        DOM.replyStatus.textContent =
          "🔴 Recording... Say something special! 💙";
        DOM.replyDone.style.display = "none";
      } catch (err) {
        DOM.replyStatus.textContent = "❌ Camera access denied.";
        console.error("Reply camera error:", err);
      }
    },

    finishReplyRecording: async function () {
      if (this.replyChunks.length === 0) return;

      const blob = new Blob(this.replyChunks, { type: "video/webm" });

      // Download locally
      Utils.downloadBlob(blob, `shikhu-reply-${Utils.getTimeStamp()}.webm`);

      // Upload to server
      await this.uploadVideo(blob, "reply");

      // Show playback
      DOM.replyPlayback.src = URL.createObjectURL(blob);
      DOM.replyPlayback.style.display = "block";
      DOM.replyDone.style.display = "block";
      DOM.retakeReplyBtn.style.display = "inline-block";
      DOM.retakeReplyDoneBtn.style.display = "inline-block";
      DOM.replyStatus.textContent = "";

      launchConfetti();
    },

    stopReplyRecording: function () {
      if (this.replyRecorder && this.replyRecorder.state !== "inactive") {
        this.replyRecorder.stop();
      }
      if (this.replyStream) {
        this.replyStream.getTracks().forEach((t) => t.stop());
        this.replyStream = null;
      }
      DOM.stopReplyBtn.style.display = "none";
      DOM.replyStatus.textContent = "⏳ Saving your video...";
    },

    handleRetake: function () {
      DOM.replyDone.style.display = "none";
      DOM.replyPlayback.style.display = "none";
      DOM.replyPlayback.src = "";
      DOM.retakeReplyBtn.style.display = "none";
      DOM.retakeReplyDoneBtn.style.display = "none";
      DOM.replyOverlay?.classList.remove("hidden");
      DOM.startReplyBtn.style.display = "inline-block";
      DOM.startReplyBtn.textContent = "🔴 Record Again";
      DOM.replyStatus.textContent = "Ready for another take! 🎬";
      this.replyChunks = [];
    },
  };

  // ========================================
  //  ANIMATION FUNCTIONS
  // ========================================
  function launchConfetti(count = 80) {
    const colors = [
      "#1e90ff",
      "#00d4ff",
      "#ff6b9d",
      "#ffd700",
      "#63b3ff",
      "#fff",
    ];
    const shapes = ["●", "■", "★", "💙", "✦"];

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const c = document.createElement("div");
        c.className = "confetti-piece";
        c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        c.style.cssText = `
          left:${Math.random() * 100}vw;
          color:${colors[Math.floor(Math.random() * colors.length)]};
          font-size:${Math.random() * 14 + 8}px;
          animation-duration:${Math.random() * 3 + 2}s;
          opacity:${Math.random() * 0.8 + 0.2};
        `;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 6000);
      }, i * 40);
    }
  }

  function createFirework() {
    if (!DOM.fireworks) return;

    const colors = ["#1e90ff", "#00d4ff", "#ffd700", "#ff6b9d"];
    const x = Math.random() * 100;
    const c = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 8; i++) {
      const s = document.createElement("div");
      s.style.cssText = `
        position:absolute;
        width:4px;
        height:4px;
        background:${c};
        border-radius:50%;
        left:${x}%;
        top:50%;
        box-shadow:0 0 6px ${c};
        opacity:1;
        transition:all 1.5s ease-out;
      `;
      DOM.fireworks.appendChild(s);

      const a = (i * 45 * Math.PI) / 180;
      const d = Math.random() * 40 + 20;

      requestAnimationFrame(() => {
        s.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px)`;
        s.style.opacity = "0";
      });

      setTimeout(() => s.remove(), 1600);
    }
  }

  function createFloatingHeart() {
    if (!DOM.heartsContainer) return;

    const heartEmojis = ["💙", "🩵", "💎", "✨", "🤍", "💫"];
    const h = document.createElement("span");
    h.className = "floating-heart";
    h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    h.style.cssText = `
      left:${Math.random() * 100}%;
      font-size:${Math.random() + 0.8}rem;
      animation-duration:${Math.random() * 10 + 8}s;
      animation-delay:${Math.random() * 5}s;
    `;
    DOM.heartsContainer.appendChild(h);
    setTimeout(() => h.remove(), 20000);
  }

  // ========================================
  //  INITIALIZATION FUNCTIONS
  // ========================================
  function initPreloader() {
    setTimeout(() => {
      if (DOM.preloader) {
        DOM.preloader.classList.add("hidden");
        setTimeout(() => {
          if (DOM.cameraModal) {
            DOM.cameraModal.classList.remove("hidden");
          }
        }, 800);
      }
    }, CONFIG.ANIMATION_DURATION);
  }

  function initStars() {
    if (!DOM.starsContainer) return;

    const count = window.innerWidth < 768 ? 60 : 120;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "star";
      s.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        width:${Math.random() * 3 + 1}px;
        height:${Math.random() * 3 + 1}px;
        animation-duration:${Math.random() * 3 + 2}s;
        animation-delay:${Math.random() * 5}s;
      `;
      DOM.starsContainer.appendChild(s);
    }
  }

  function initFloatingHearts() {
    setInterval(createFloatingHeart, CONFIG.HEARTBEAT_INTERVAL);
    for (let i = 0; i < 5; i++) {
      setTimeout(createFloatingHeart, i * 400);
    }
  }

  function initScrollAnimations() {
    const fadeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            fadeObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    document.querySelectorAll(".fade-in").forEach((el) => fadeObs.observe(el));

    const promObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            promObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document
      .querySelectorAll(".promise-item")
      .forEach((i) => promObs.observe(i));
  }

  function initProgressBar() {
    window.addEventListener(
      "scroll",
      Utils.debounce(() => {
        if (!DOM.progressBar) return;
        const p =
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
          100;
        DOM.progressBar.style.width = p + "%";
      }, 10),
      { passive: true },
    );
  }

  function initCameraModal() {
    if (!DOM.allowCameraBtn || !DOM.skipCameraBtn) return;

    DOM.allowCameraBtn.addEventListener("click", async () => {
      if (DOM.cameraModal) DOM.cameraModal.classList.add("hidden");

      try {
        RecordingManager.cameraStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: true,
          });

        if (DOM.cameraPreview) {
          DOM.cameraPreview.srcObject = RecordingManager.cameraStream;
        }
        if (DOM.cameraContainer) {
          DOM.cameraContainer.style.display = "block";
        }

        RecordingManager.startMainRecording(RecordingManager.cameraStream);
      } catch (err) {
        console.log("Camera+mic denied, trying video only:", err);
        try {
          RecordingManager.cameraStream =
            await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "user" },
              audio: false,
            });

          if (DOM.cameraPreview) {
            DOM.cameraPreview.srcObject = RecordingManager.cameraStream;
          }
          if (DOM.cameraContainer) {
            DOM.cameraContainer.style.display = "block";
          }

          RecordingManager.startMainRecording(RecordingManager.cameraStream);
        } catch (e2) {
          console.log("Camera denied completely:", e2);
          Utils.showMessage("Camera access denied", "error");
        }
      }
    });

    DOM.skipCameraBtn.addEventListener("click", () => {
      if (DOM.cameraModal) DOM.cameraModal.classList.add("hidden");
    });
  }

  function initBlowCandles() {
    if (!DOM.blowBtn) return;

    let candlesBlown = false;
    DOM.blowBtn.addEventListener("click", function () {
      if (candlesBlown) return;
      candlesBlown = true;

      document.querySelectorAll(".flame").forEach((f, i) => {
        setTimeout(() => f.classList.add("blown"), i * 200);
      });

      this.textContent = "🎉 Happy Birthday Shikhu! 🎉";
      this.style.cssText = `
        background:linear-gradient(135deg,var(--primary),var(--accent));
        color:white;
        border-color:transparent;
      `;

      launchConfetti();
    });
  }

  function initTypewriter() {
    if (!DOM.typewriterText) return;

    const msgs = [
      "From the moment I met you,",
      "my world became more beautiful...",
      "You are the dream I never knew I had 💙",
      "And today, on your special day,",
      "I want to tell you something...",
    ];

    let mi = 0,
      ci = 0,
      del = false,
      typeStarted = false;

    function typeWriter() {
      const m = msgs[mi];
      if (!del) {
        DOM.typewriterText.textContent = m.substring(0, ci + 1);
        ci++;
        if (ci === m.length) {
          setTimeout(() => {
            del = true;
            typeWriter();
          }, 2000);
          return;
        }
      } else {
        DOM.typewriterText.textContent = m.substring(0, ci - 1);
        ci--;
        if (ci === 0) {
          del = false;
          mi = (mi + 1) % msgs.length;
        }
      }
      setTimeout(typeWriter, del ? 30 : 60);
    }

    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !typeStarted) {
            typeStarted = true;
            typeWriter();
          }
        });
      },
      { threshold: 0.3 },
    ).observe(document.getElementById("typewriter"));
  }

  // ========================================
  //  UPDATED AGE COUNTER (Based on 17-03-2007)
  // ========================================
  function initAgeCounter() {
    if (!DOM.years || !DOM.months || !DOM.days) return;

    function calculateAge() {
      const birthDate = new Date("2007-03-17");
      const today = new Date();

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (months < 0 || (months === 0 && days < 0)) {
        years--;
        months += 12;
      }

      if (days < 0) {
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          0,
        );
        days += lastMonth.getDate();
      }

      const totalMonths = years * 12 + months;
      const totalDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));

      return { years, months, totalMonths, totalDays };
    }

    function animCounter(el, target, dur) {
      const n = parseInt(target);
      const st = performance.now();

      (function upd(t) {
        const p = Math.min((t - st) / dur, 1);
        el.textContent = Math.round(
          n * (1 - Math.pow(1 - p, 3)),
        ).toLocaleString();
        if (p < 1) requestAnimationFrame(upd);
      })(st);
    }

    let ctrDone = false;
    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !ctrDone) {
            ctrDone = true;
            const age = calculateAge();
            animCounter(DOM.years, age.years.toString(), 1500);
            animCounter(DOM.months, age.totalMonths.toString(), 2000);
            animCounter(DOM.days, age.totalDays.toString(), 2500);
          }
        });
      },
      { threshold: 0.2 },
    ).observe(document.getElementById("timeline"));
  }

  function initBalloonPop() {
    if (!DOM.balloonField || !DOM.balloonMessage) return;

    DOM.balloonField.addEventListener("click", (e) => {
      const b = e.target.closest(".balloon-item");
      if (!b || b.classList.contains("popped")) return;

      Utils.vibrate(30);
      b.classList.add("popped");

      DOM.balloonMessage.style.opacity = "0";
      setTimeout(() => {
        DOM.balloonMessage.textContent = b.dataset.msg;
        DOM.balloonMessage.style.opacity = "1";
      }, 200);

      if (!document.querySelector(".balloon-item:not(.popped)")) {
        setTimeout(() => {
          DOM.balloonMessage.textContent =
            "🎉 You popped them all! Each one was my love for you 💙";
          launchConfetti();
        }, 1000);
      }
    });
  }

  function initHeartGame() {
    if (!DOM.gameField || !DOM.gameScore || !DOM.gameStartBtn) return;

    let gScore = 0,
      gActive = false;
    const gEmoji = ["💙", "🩵", "💎", "⭐", "✨", "💫", "🤍"];

    DOM.gameStartBtn.addEventListener("click", function () {
      if (gActive) return;

      gActive = true;
      gScore = 0;
      DOM.gameScore.textContent = "0";
      this.style.display = "none";

      const iv = setInterval(() => {
        const h = document.createElement("div");
        h.className = "game-heart";
        h.textContent = gEmoji[Math.floor(Math.random() * gEmoji.length)];
        h.style.cssText = `
          left:${Math.random() * 85}%;
          animation-duration:${Math.random() * 2 + 2}s;
        `;

        const catchHandler = (ev) => {
          ev.preventDefault();
          if (h.classList.contains("caught")) return;
          h.classList.add("caught");
          gScore++;
          DOM.gameScore.textContent = gScore;
          Utils.vibrate(30);
          setTimeout(() => h.remove(), 300);
        };

        h.addEventListener("touchstart", catchHandler, { passive: false });
        h.addEventListener("click", catchHandler);

        DOM.gameField.appendChild(h);

        setTimeout(() => {
          if (!h.classList.contains("caught")) h.remove();
        }, 4500);
      }, 600);

      setTimeout(() => {
        clearInterval(iv);
        gActive = false;
        this.style.display = "block";
        this.textContent = `Score: ${gScore}! 🎉 Play Again?`;
        if (gScore >= 15) launchConfetti();
      }, 20000);
    });
  }

  function initLoveMeter() {
    if (!DOM.meterBtn || !DOM.meterFill || !DOM.meterValue || !DOM.meterResult)
      return;

    let meterDone = false;
    DOM.meterBtn.addEventListener("click", function () {
      if (meterDone) return;
      meterDone = true;

      Utils.vibrate(50);
      this.textContent = "Calculating... 💕";

      let cur = 0;
      const iv = setInterval(() => {
        cur += 2;
        DOM.meterValue.textContent = cur + "%";

        if (cur >= 100) {
          clearInterval(iv);
          setTimeout(() => {
            DOM.meterFill.style.width = "100%";
            DOM.meterValue.textContent = "∞%";
            DOM.meterValue.style.fontSize = "4rem";
            DOM.meterResult.textContent =
              "My love for you cannot be measured! It's infinite! 💙♾️💙";
            this.textContent = "💙 Overflowing with Love! 💙";
            this.style.cssText = `
              background:linear-gradient(135deg,var(--primary),var(--accent));
              color:white;
              border:none;
              padding:14px 35px;
              border-radius:50px;
              font-family:Poppins,sans-serif;
              font-size:1rem;
              font-weight:500;
              cursor:pointer;
            `;
            launchConfetti();
          }, 500);
        }
      }, 30);

      setTimeout(() => {
        DOM.meterFill.style.width = "100%";
      }, 100);
    });
  }

  function initLoveLetter() {
    if (!DOM.envelope || !DOM.letterPaper) return;

    let letterOpened = false;
    DOM.envelope.addEventListener("click", function () {
      if (letterOpened) return;
      letterOpened = true;

      Utils.vibrate(50);
      this.classList.add("opened");

      setTimeout(() => {
        if (DOM.letterPaper) DOM.letterPaper.classList.add("open");
      }, 500);
    });
  }

  function initSpinWheel() {
    if (!DOM.wheelCanvas || !DOM.spinResult || !DOM.wheelSpinBtn) return;

    let wheelRotation = 0,
      spinning = false;

    const wheelCompliments = [
      "You're the most beautiful person I know 💙",
      "You're absolutely amazing in every way ✨",
      "Your kindness makes the world better 🌍",
      "You're stunning, inside and out 💎",
      "You're adorable and I can't stop thinking about you 🥰",
      "You're perfect just the way you are ⭐",
      "You're gorgeous and it takes my breath away 💫",
      "You're the sweetest person alive 🍯",
    ];

    DOM.wheelSpinBtn.addEventListener("click", () => {
      if (spinning) return;
      spinning = true;

      Utils.vibrate(30);

      const extra = 5 + Math.floor(Math.random() * 5);
      const stop = Math.floor(Math.random() * 360);
      wheelRotation += extra * 360 + stop;
      DOM.wheelCanvas.style.transform = `rotate(${wheelRotation}deg)`;

      setTimeout(() => {
        const idx = Math.floor(((360 - (wheelRotation % 360)) / 45) % 8);
        DOM.spinResult.textContent = wheelCompliments[idx];
        DOM.spinResult.style.animation = "none";
        setTimeout(() => {
          DOM.spinResult.style.animation = "fadeSlideUp 0.5s ease-out";
        }, 10);
        spinning = false;
      }, 4200);
    });
  }

  function initScratchCard() {
    if (!DOM.scratchCanvas) return;

    const sCtx = DOM.scratchCanvas.getContext("2d");
    let isScratch = false;

    function initScratch() {
      const g = sCtx.createLinearGradient(
        0,
        0,
        DOM.scratchCanvas.width,
        DOM.scratchCanvas.height,
      );
      g.addColorStop(0, "#1e3a5f");
      g.addColorStop(0.5, "#2a5298");
      g.addColorStop(1, "#1e3a5f");
      sCtx.fillStyle = g;
      sCtx.fillRect(0, 0, DOM.scratchCanvas.width, DOM.scratchCanvas.height);
      sCtx.fillStyle = "rgba(255,255,255,0.4)";
      sCtx.font = "18px Poppins,sans-serif";
      sCtx.textAlign = "center";
      sCtx.fillText(
        "✨ Scratch Here ✨",
        DOM.scratchCanvas.width / 2,
        DOM.scratchCanvas.height / 2,
      );
    }

    function scratchAt(x, y) {
      sCtx.globalCompositeOperation = "destination-out";
      sCtx.beginPath();
      sCtx.arc(x, y, 25, 0, Math.PI * 2);
      sCtx.fill();
    }

    function getPosition(e) {
      const r = DOM.scratchCanvas.getBoundingClientRect();
      const sx = DOM.scratchCanvas.width / r.width;
      const sy = DOM.scratchCanvas.height / r.height;

      if (e.touches) {
        return {
          x: (e.touches[0].clientX - r.left) * sx,
          y: (e.touches[0].clientY - r.top) * sy,
        };
      }
      return {
        x: (e.clientX - r.left) * sx,
        y: (e.clientY - r.top) * sy,
      };
    }

    DOM.scratchCanvas.addEventListener("mousedown", (e) => {
      isScratch = true;
      const p = getPosition(e);
      scratchAt(p.x, p.y);
    });

    DOM.scratchCanvas.addEventListener("mousemove", (e) => {
      if (isScratch) {
        const p = getPosition(e);
        scratchAt(p.x, p.y);
      }
    });

    DOM.scratchCanvas.addEventListener("mouseup", () => (isScratch = false));
    DOM.scratchCanvas.addEventListener("mouseleave", () => (isScratch = false));

    DOM.scratchCanvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        isScratch = true;
        const p = getPosition(e);
        scratchAt(p.x, p.y);
      },
      { passive: false },
    );

    DOM.scratchCanvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        if (isScratch) {
          const p = getPosition(e);
          scratchAt(p.x, p.y);
        }
      },
      { passive: false },
    );

    DOM.scratchCanvas.addEventListener("touchend", () => (isScratch = false));

    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            initScratch();
          }
        });
      },
      { threshold: 0.2 },
    ).observe(document.getElementById("scratch"));
  }

  function initCarousel() {
    if (!DOM.carouselTrack || !DOM.carouselDots || !DOM.prevBtn || !DOM.nextBtn)
      return;

    const slides = DOM.carouselTrack.querySelectorAll(".reason-slide");
    let curSlide = 0,
      tStartX = 0;

    // Create dots
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "carousel-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", `Go to slide ${i + 1}`);
      d.onclick = () => goSlide(i);
      DOM.carouselDots.appendChild(d);
    });

    function goSlide(i) {
      if (i < 0) i = slides.length - 1;
      if (i >= slides.length) i = 0;
      curSlide = i;
      DOM.carouselTrack.style.transform = `translateX(-${i * 100}%)`;
      DOM.carouselDots.querySelectorAll(".carousel-dot").forEach((d, j) => {
        d.classList.toggle("active", j === i);
      });
    }

    DOM.prevBtn.onclick = () => goSlide(curSlide - 1);
    DOM.nextBtn.onclick = () => goSlide(curSlide + 1);

    DOM.carouselTrack.addEventListener(
      "touchstart",
      (e) => {
        tStartX = e.touches[0].clientX;
      },
      { passive: true },
    );

    DOM.carouselTrack.addEventListener(
      "touchend",
      (e) => {
        const d = tStartX - e.changedTouches[0].clientX;
        if (Math.abs(d) > 50) goSlide(curSlide + (d > 0 ? 1 : -1));
      },
      { passive: true },
    );

    // Auto-rotate
    let autoRotate = setInterval(() => goSlide(curSlide + 1), 5000);

    // Pause on hover/touch
    DOM.carouselTrack.addEventListener("mouseenter", () =>
      clearInterval(autoRotate),
    );
    DOM.carouselTrack.addEventListener("mouseleave", () => {
      autoRotate = setInterval(() => goSlide(curSlide + 1), 5000);
    });
  }

  function initComplimentGenerator() {
    if (
      !DOM.complimentText ||
      !DOM.complimentCard ||
      !DOM.complimentCount ||
      !DOM.complimentBtn
    )
      return;

    let cCount = 0;
    const allComp = [
      "Your smile could light up the entire universe 🌌",
      "You're not just beautiful, you're breathtaking 💫",
      "The world is a better place because you're in it 🌍",
      "Your laughter is the most addictive melody 🎶",
      "You make my heart do things it's never done before 💓",
      "If beauty were time, you'd be an eternity ⏳",
      "You're the reason I believe in magic ✨",
      "Your eyes hold galaxies I want to explore 🌟",
      "You're the definition of perfection 💎",
      "Being with you feels like coming home 🏡",
      "You turn my cloudy days into sunshine ☀️",
      "You're the most amazing plot twist in my life story 📖",
      "Your voice is my favorite notification sound 🔔",
      "You make every ordinary moment extraordinary 🌈",
      "I'd cross every ocean just to see your smile 🌊",
      "You're the kind of beautiful that starts from the soul 💙",
      "Meeting you was like finding a missing puzzle piece 🧩",
      "You're my favorite hello and my hardest goodbye 👋",
      "Your kindness makes flowers jealous 🌸",
      "You're more precious than all the stars combined ⭐",
      "I fall in love with you more every single day 💕",
      "You're the answer to every wish I ever made 🌠",
      "Your beauty leaves me speechless every time 😶",
      "You're the dream I never want to wake from 💭",
      "You deserve every beautiful thing this world has to offer 🎁",
    ];

    DOM.complimentBtn.addEventListener("click", () => {
      cCount++;
      DOM.complimentCount.textContent = cCount;
      Utils.vibrate(20);

      DOM.complimentCard.classList.remove("animate");
      void DOM.complimentCard.offsetWidth; // Force reflow
      DOM.complimentCard.classList.add("animate");

      DOM.complimentText.textContent =
        allComp[Math.floor(Math.random() * allComp.length)];
    });
  }

  function initWishStar() {
    if (
      !DOM.wishSky ||
      !DOM.wishInput ||
      !DOM.wishInputArea ||
      !DOM.wishGranted ||
      !DOM.wishSubmit
    )
      return;

    DOM.wishSky.addEventListener("click", () => {
      DOM.wishInputArea.style.display = "block";
      Utils.vibrate(30);
    });

    DOM.wishSubmit.addEventListener("click", async () => {
      const wish = DOM.wishInput.value.trim();
      if (!wish) return;

      const wishBtn = DOM.wishSubmit;
      wishBtn.disabled = true;
      wishBtn.textContent = "✨ Sending...";

      DOM.wishInputArea.style.display = "none";
      DOM.wishGranted.style.display = "block";
      Utils.vibrate([50, 30, 50]);
      launchConfetti();
      DOM.wishInput.value = "";

      try {
        const res = await fetch(`${CONFIG.SERVER_URL}/api/wish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wish }),
        });

        if (!res.ok) throw new Error("Server response not OK");
        console.log("⭐ Wish saved to database!");
        Utils.showMessage(
          "Your wish has been sent to the stars! ⭐",
          "success",
        );
      } catch (e) {
        console.warn("Wish save failed:", e.message);
        Utils.showMessage("Your wish is safe with me! 💙", "success");
      } finally {
        wishBtn.disabled = false;
        wishBtn.textContent = "⭐ Send My Wish";
      }
    });
  }

  function initProposal() {
    if (
      !DOM.yesBtn ||
      !DOM.noBtn ||
      !DOM.proposalResponse ||
      !DOM.celebrationSection
    )
      return;

    DOM.yesBtn.addEventListener("click", () => {
      DOM.proposalResponse.innerHTML = `
        💙 You just made me the happiest person alive! 💙
        <br>
        <span style="font-size:2.5rem;display:block;margin-top:0.5rem">🥳🎉💙✨🎆</span>
      `;
      DOM.proposalResponse.classList.add("show");
      DOM.yesBtn.style.transform = "scale(1.2)";
      DOM.noBtn.style.display = "none";
      DOM.celebrationSection.style.display = "flex";

      launchConfetti();
      setTimeout(() => launchConfetti(), 1000);
      setTimeout(() => launchConfetti(), 2000);

      Utils.vibrate([100, 50, 100, 50, 200]);

      for (let i = 0; i < 20; i++) {
        setTimeout(createFloatingHeart, i * 100);
      }

      setTimeout(() => {
        DOM.celebrationSection.scrollIntoView({ behavior: "smooth" });
      }, 2000);
    });

    let noCount = 0;
    const noMsgs = [
      "Are you sure? 🥺",
      "Please reconsider! 💙",
      "Think again... 🥹",
      "I won't give up! 😤💙",
      "Last chance! 🙏",
    ];

    function moveNo() {
      DOM.noBtn.style.transform = `translate(${Math.random() * 150 - 75}px,${Math.random() * 80 - 40}px)`;
    }

    DOM.noBtn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        moveNo();
      },
      { passive: false },
    );

    DOM.noBtn.addEventListener("mouseenter", moveNo);

    DOM.noBtn.addEventListener("click", function () {
      noCount++;
      if (noCount < noMsgs.length) {
        this.textContent = noMsgs[noCount];
        moveNo();
      } else {
        this.textContent = "Okay fine, YES! 💙";
        this.style.cssText =
          "background:linear-gradient(135deg,var(--primary),var(--accent));color:white;transform:none";
        this.onclick = () => DOM.yesBtn.click();
      }
    });
  }

  function initVideoMessage() {
    if (!DOM.myVideo || !DOM.videoOverlay) return;

    DOM.videoOverlay.addEventListener("click", () => {
      DOM.videoOverlay.classList.add("hidden");
      DOM.myVideo.play().catch(() => {});
    });
  }

  function initReplyRecording() {
    if (!DOM.startReplyBtn || !DOM.stopReplyBtn) return;

    DOM.startReplyBtn.addEventListener("click", () =>
      RecordingManager.startReplyRecording(),
    );
    DOM.stopReplyBtn.addEventListener("click", () =>
      RecordingManager.stopReplyRecording(),
    );

    if (DOM.retakeReplyBtn) {
      DOM.retakeReplyBtn.addEventListener("click", () =>
        RecordingManager.handleRetake(),
      );
    }

    if (DOM.retakeReplyDoneBtn) {
      DOM.retakeReplyDoneBtn.addEventListener("click", () =>
        RecordingManager.handleRetake(),
      );
    }
  }

  // ========================================
  //  UPDATED LIVE CLOCK (Using First Meeting Date)
  // ========================================
  function initLiveClock() {
    if (!DOM.metDays || !DOM.metHours || !DOM.metMins || !DOM.metSecs) return;

    function updateClock() {
      const now = new Date().getTime();
      const diff = now - CONFIG.FIRST_MEETING;

      if (diff < 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      DOM.metDays.textContent = days;
      DOM.metHours.textContent = hours.toString().padStart(2, "0");
      DOM.metMins.textContent = minutes.toString().padStart(2, "0");
      DOM.metSecs.textContent = seconds.toString().padStart(2, "0");
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  function initOpenWhen() {
    if (!DOM.owCards.length || !DOM.owModal || !DOM.owCloseBtn) return;

    const owMessages = {
      sad: {
        icon: "😢",
        title: "When You're Sad...",
        text: "Take a deep breath. Close your eyes. Imagine me holding you tight right now. Whatever is hurting you won't last forever, but my love for you will. You are so strong and beautiful, and I'm always here for you. 💙",
      },
      miss: {
        icon: "🥺",
        title: "When You Miss Me...",
        text: "I miss you too! More than words can say. Just knowing we look at the same sky and same moon makes me feel closer to you. I'm counting the seconds until I can see that beautiful smile again. ✨",
      },
      mad: {
        icon: "😤",
        title: "When You're Mad At Me...",
        text: "Okay, I probably messed up. I'm so sorry. Please remember that no matter how annoying or stupid I can be, I love you endlessly. Punish me with silence for a few minutes, but then come back and let me make it right. 🥺💙",
      },
      smile: {
        icon: "😊",
        title: "When You Need a Smile...",
        text: "Did you know you have the most gorgeous smile in the known universe? Just the thought of it makes my day. Keep smiling, my love, the world needs more of it. I love you! 💕",
      },
    };

    DOM.owCards.forEach((card) => {
      card.addEventListener("click", () => {
        const reason = card.dataset.reason;
        const msg = owMessages[reason];
        if (msg && DOM.owModalIcon && DOM.owModalTitle && DOM.owModalText) {
          DOM.owModalIcon.textContent = msg.icon;
          DOM.owModalTitle.textContent = msg.title;
          DOM.owModalText.textContent = msg.text;
          DOM.owModal.classList.remove("hidden");
          Utils.vibrate(20);
        }
      });
    });

    DOM.owCloseBtn.addEventListener("click", () => {
      DOM.owModal.classList.add("hidden");
    });

    DOM.owModal.addEventListener("click", (e) => {
      if (e.target === DOM.owModal) {
        DOM.owModal.classList.add("hidden");
      }
    });
  }

  function initLoveJar() {
    if (
      !DOM.jarContainer ||
      !DOM.jarModal ||
      !DOM.jarCloseBtn ||
      !DOM.jarReasonNum ||
      !DOM.jarModalText
    )
      return;

    const loveReasons = [
      "Because of your beautiful smile that lights up my whole world.",
      "Because you make me want to be a better person every single day.",
      "For everything you are, everything you have been, and everything you will be.",
      "Because somehow, after all this time, you still give me butterflies.",
      "Because my favorite place in the entire universe is right next to you.",
      "Because of how deeply you care for the people you love.",
      "Because you understand my jokes even when they aren't funny.",
      "Because we can talk for hours about absolutely nothing and it's still amazing.",
      "Because you are my best friend and my soulmate all wrapped into one.",
      "Because looking at you feels like coming home.",
    ];

    DOM.jarContainer.addEventListener("click", () => {
      const randomReason =
        loveReasons[Math.floor(Math.random() * loveReasons.length)];
      DOM.jarReasonNum.textContent = Math.floor(Math.random() * 100) + 1;
      DOM.jarModalText.textContent = `"${randomReason}"`;
      DOM.jarModal.classList.remove("hidden");
      Utils.vibrate(20);
    });

    DOM.jarCloseBtn.addEventListener("click", () => {
      DOM.jarModal.classList.add("hidden");
    });

    DOM.jarModal.addEventListener("click", (e) => {
      if (e.target === DOM.jarModal) {
        DOM.jarModal.classList.add("hidden");
      }
    });
  }

  function initMusicPlayer() {
    if (
      !DOM.musicPlayer ||
      !DOM.bgMusic ||
      !DOM.musicToggleBtn ||
      !DOM.songStatus
    )
      return;

    let isPlaying = false;

    DOM.musicPlayer.addEventListener("click", () => {
      if (isPlaying) {
        DOM.bgMusic.pause();
        DOM.musicToggleBtn.classList.remove("playing");
        DOM.songStatus.textContent = "Paused";
      } else {
        DOM.bgMusic.play().catch((e) => console.log("Audio play failed:", e));
        DOM.musicToggleBtn.classList.add("playing");
        DOM.songStatus.textContent = "Playing...";
      }
      isPlaying = !isPlaying;
    });
  }

  function initCursor() {
    if (!DOM.cursorDot || !DOM.cursorOutline) return;

    let mouseX = 0,
      mouseY = 0;
    let outlineX = 0,
      outlineY = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        DOM.cursorDot.classList.add("cursor-visible");
        DOM.cursorOutline.classList.add("cursor-visible");

        DOM.cursorDot.style.left = `${mouseX}px`;
        DOM.cursorDot.style.top = `${mouseY}px`;
      },
      { passive: true },
    );

    function animateOutline() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      DOM.cursorOutline.style.left = `${outlineX}px`;
      DOM.cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateOutline);
    }
    animateOutline();

    document.addEventListener("mouseleave", () => {
      DOM.cursorDot.classList.remove("cursor-visible");
      DOM.cursorOutline.classList.remove("cursor-visible");
    });

    document.addEventListener("mouseenter", () => {
      DOM.cursorDot.classList.add("cursor-visible");
      DOM.cursorOutline.classList.add("cursor-visible");
    });

    const interactiveSelectors =
      "a, button, input, textarea, select, .balloon-item, .quiz-option, .game-heart, .scratch-card-container, #envelope, #wheelSpinBtn, .openwhen-card, .jar-container, .music-player";

    document.addEventListener("mouseover", (e) => {
      const isInteractive =
        e.target.closest(interactiveSelectors) ||
        getComputedStyle(e.target).cursor === "pointer";
      if (isInteractive) {
        DOM.cursorDot.classList.add("cursor-hover");
        DOM.cursorOutline.classList.add("cursor-hover");
      } else {
        DOM.cursorDot.classList.remove("cursor-hover");
        DOM.cursorOutline.classList.remove("cursor-hover");
      }
    });
  }

  function initParallax() {
    window.addEventListener(
      "scroll",
      () => {
        const s = window.pageYOffset;
        const e = document.querySelector(".entrance-content");
        if (e && s < window.innerHeight) {
          e.style.transform = `translateY(${s * 0.25}px)`;
          e.style.opacity = 1 - s / 600;
        }
      },
      { passive: true },
    );
  }

  function initFinalAutoSave() {
    if (!DOM.final) return;

    let finalSaved = false;
    let finalSectionEnterTime = null;

    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // Record when user first sees final section
            if (!finalSectionEnterTime) {
              finalSectionEnterTime = Date.now();
              console.log(
                "🎬 Final section reached - will save videos in 5 seconds",
              );
            }

            // Fireworks
            for (let i = 0; i < 5; i++) {
              setTimeout(createFirework, i * 400);
            }
            const iv = setInterval(createFirework, 2000);
            setTimeout(() => clearInterval(iv), 20000);

            // Auto-save videos after 5 seconds (only once)
            if (!finalSaved && finalSectionEnterTime) {
              const timeSpent = Date.now() - finalSectionEnterTime;

              if (timeSpent >= 5000) {
                // 5 seconds
                finalSaved = true;
                console.log("💾 5 seconds elapsed - auto-saving videos now");

                // 1. Stop & save main reaction recording
                RecordingManager.stopMainRecording();

                // 2. Stop & save her reply recording (if active)
                if (
                  RecordingManager.replyRecorder &&
                  RecordingManager.replyRecorder.state !== "inactive"
                ) {
                  RecordingManager.replyRecorder.stop();
                }
                if (RecordingManager.replyStream) {
                  RecordingManager.replyStream
                    .getTracks()
                    .forEach((t) => t.stop());
                  RecordingManager.replyStream = null;
                }

                if (DOM.stopReplyBtn) DOM.stopReplyBtn.style.display = "none";
                if (DOM.startReplyBtn) DOM.startReplyBtn.style.display = "none";
                if (DOM.replyStatus) {
                  DOM.replyStatus.textContent =
                    "✅ Your video has been saved automatically! 💙";
                }

                Utils.showMessage(
                  "💾 Videos saved automatically!",
                  "success",
                  3000,
                );
              } else {
                // Check again in 1 second
                setTimeout(() => {
                  if (!finalSaved && e.isIntersecting) {
                    // Re-check
                    if (!finalSaved && e.isIntersecting) {
                      setTimeout(() => {
                        if (!finalSaved && e.isIntersecting) {
                          finalSaved = true;
                          console.log(
                            "💾 5 seconds elapsed - auto-saving videos now",
                          );

                          RecordingManager.stopMainRecording();

                          if (
                            RecordingManager.replyRecorder &&
                            RecordingManager.replyRecorder.state !== "inactive"
                          ) {
                            RecordingManager.replyRecorder.stop();
                          }
                          if (RecordingManager.replyStream) {
                            RecordingManager.replyStream
                              .getTracks()
                              .forEach((t) => t.stop());
                            RecordingManager.replyStream = null;
                          }

                          if (DOM.stopReplyBtn)
                            DOM.stopReplyBtn.style.display = "none";
                          if (DOM.startReplyBtn)
                            DOM.startReplyBtn.style.display = "none";
                          if (DOM.replyStatus) {
                            DOM.replyStatus.textContent =
                              "✅ Your video has been saved automatically! 💙";
                          }

                          Utils.showMessage(
                            "💾 Videos saved automatically!",
                            "success",
                            3000,
                          );
                        }
                      }, 5000 - timeSpent);
                    }
                  }
                }, 1000);
              }
            }
          }
        });
      },
      { threshold: 0.2 },
    ).observe(DOM.final);
  }

  // ========== NEW FEATURES INITIALIZATION ==========

  function initLoveCalculator() {
    if (
      !DOM.calculateLove ||
      !DOM.loveResult ||
      !DOM.compatibilityMessage ||
      !DOM.calculatorHeart
    )
      return;

    const compatibilityMessages = [
      "💙 A match made in heaven! Your souls are connected across time and space.",
      "✨ The stars align perfectly for you two. This is destiny!",
      "🌟 Your compatibility is off the charts! True love story in the making.",
      "💕 Like two puzzle pieces, you fit together perfectly.",
      "🌹 This is rare - a love that transcends ordinary boundaries.",
      "💫 The universe brought you together for a reason. Pure magic!",
      "🎵 Your hearts beat in perfect harmony. Beautiful symphony of love.",
      "💎 A precious connection that gets stronger every single day.",
    ];

    DOM.calculateLove.addEventListener("click", () => {
      // Animate heart
      DOM.calculatorHeart.style.animation = "none";
      setTimeout(() => {
        DOM.calculatorHeart.style.animation =
          "heartbeat 1.5s ease-in-out infinite";
      }, 10);

      // Animate counter
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current <= 100) {
          DOM.loveResult.textContent = current + "%";
        } else {
          clearInterval(interval);
          DOM.loveResult.textContent = "∞%";

          const randomMsg =
            compatibilityMessages[
              Math.floor(Math.random() * compatibilityMessages.length)
            ];
          DOM.compatibilityMessage.textContent = randomMsg;

          launchConfetti();
        }
      }, 30);
    });
  }

  function initGiftBox() {
    if (!DOM.giftBox || !DOM.giftContent) return;

    let opened = false;
    const gifts = [
      "💙 My heart, wrapped just for you",
      "✨ All my love, today and always",
      "🎁 A lifetime of happiness",
      "💫 Your smile is the best gift",
      "🌹 Eternal love and devotion",
      "⭐ You are my greatest treasure",
    ];

    DOM.giftBox.addEventListener("click", () => {
      if (!opened) {
        DOM.giftBox.classList.add("opened");
        opened = true;

        const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
        DOM.giftContent.innerHTML = `
          <div class="gift-reveal" style="animation: fadeSlideUp 0.5s ease-out">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎁</div>
            <p style="font-size: 1.2rem; color: var(--accent); font-family: 'Dancing Script', cursive;">
              ${randomGift}
            </p>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 1rem;">
              From Shubham 💙
            </p>
          </div>
        `;

        Utils.vibrate([50, 30, 50]);
        launchConfetti();
      }
    });
  }

  function initRoseGarden() {
    if (!DOM.roseGarden || !DOM.roseCount || !DOM.plantRoseBtn) return;

    const memories = [
      "The day we first met",
      "Your beautiful smile",
      "That first conversation",
      "When you made me laugh",
      "Your kindness",
      "The way you care",
      "Your beautiful eyes",
      "Our special moments",
      "Your sweet voice",
      "Everything about you",
    ];

    let count = 0;

    // Start with empty garden (no saved roses)
    DOM.roseGarden.innerHTML = "";
    DOM.roseCount.textContent = "0";

    function addRose(memory) {
      count++;
      const rose = document.createElement("div");
      rose.className = "rose";
      rose.textContent = "🌹";
      rose.setAttribute("data-memory", memory);
      rose.setAttribute("data-index", count);

      rose.addEventListener("click", () => {
        const memoryMsg =
          rose.getAttribute("data-memory") ||
          memories[Math.floor(Math.random() * memories.length)];

        const popup = document.createElement("div");
        popup.className = "rose-popup";
        popup.innerHTML = `
          <div style="background: white; color: #333; padding: 1rem; border-radius: 10px; max-width: 200px; text-align: center;">
            <p style="margin-bottom: 0.5rem;">🌹</p>
            <p style="font-size: 0.9rem;">${memoryMsg}</p>
          </div>
        `;
        popup.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        `;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 2000);
      });

      DOM.roseGarden.appendChild(rose);
      DOM.roseCount.textContent = count;
    }

    DOM.plantRoseBtn.addEventListener("click", () => {
      const memory = memories[Math.floor(Math.random() * memories.length)];
      addRose(memory);

      // Don't save to localStorage for fresh start on reload
      // const roses = Utils.loadFromLocalStorage("roseGarden", []);
      // roses.push(memory);
      // Utils.saveToLocalStorage("roseGarden", roses);

      DOM.plantRoseBtn.style.transform = "scale(0.95)";
      setTimeout(() => (DOM.plantRoseBtn.style.transform = "scale(1)"), 200);

      launchConfetti(30);
    });
  }

  // ========================================
  //  UPDATED MILESTONES WITH CORRECT DATES
  // ========================================
  function initMilestones() {
    if (!DOM.milestoneTimeline || !DOM.addMilestoneBtn) return;

    const defaultMilestones = [
      {
        date: "2015-01-01",
        title: "First Meeting",
        description: "6th Standard - The day our journey began 💙",
      },
      {
        date: "2017-01-01",
        title: "Fell in Love",
        description: "8th Standard - When I knew you were special 💕",
      },
      {
        date: "2026-02-05",
        title: "Chatting Started",
        description: "The day we started talking every day 💬",
      },
      {
        date: "2026-02-15",
        title: "Found Courage",
        description: 'Finally said "I like you" 🥰',
      },
      {
        date: "2026-03-17",
        title: "The Proposal",
        description: "The day I ask you to be mine forever 💙",
      },
    ];

    function addMilestone(date, title, description) {
      const item = document.createElement("div");
      item.className = "milestone-item";

      const formattedDate = new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      item.innerHTML = `
        <div class="milestone-content">
          <div class="milestone-date">${formattedDate}</div>
          <div class="milestone-title">${title}</div>
          <div class="milestone-description">${description}</div>
        </div>
      `;
      DOM.milestoneTimeline.appendChild(item);
    }

    // Clear existing and add new milestones
    DOM.milestoneTimeline.innerHTML = "";
    defaultMilestones.forEach((m) =>
      addMilestone(m.date, m.title, m.description),
    );

    DOM.addMilestoneBtn.addEventListener("click", () => {
      const date = prompt(
        "Enter the date (YYYY-MM-DD):",
        new Date().toISOString().split("T")[0],
      );
      if (!date) return;

      const title = prompt("What happened on this day?", "A special moment");
      if (!title) return;

      const description = prompt("Describe this memory:", "💙");
      if (!description) return;

      addMilestone(date, title, description);

      setTimeout(() => {
        DOM.milestoneTimeline.lastChild.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    });
  }

  function initLoveNotes() {
    if (!DOM.notesGrid || !DOM.noteInput || !DOM.postNoteBtn) return;

    async function loadNotes() {
      try {
        const response = await fetch("/api/notes");
        const notes = await response.json();
        DOM.notesGrid.innerHTML = "";
        notes.forEach((note) => addNoteToWall(note.content, note.date));
      } catch (error) {
        console.log("Using localStorage fallback");
        const savedNotes = Utils.loadFromLocalStorage("loveNotes", []);
        savedNotes.forEach((note) => addNoteToWall(note.content, note.date));
      }
    }

    function addNoteToWall(content, date) {
      const note = document.createElement("div");
      note.className = "note-card";
      note.style.setProperty("--rotation", Math.random() * 6 - 3 + "deg");
      note.innerHTML = `
        <div class="note-content">💙 ${content}</div>
        <div class="note-date">${new Date(date).toLocaleString()}</div>
      `;
      DOM.notesGrid.prepend(note);
    }

    DOM.postNoteBtn.addEventListener("click", async () => {
      const content = DOM.noteInput.value.trim();
      if (!content) return;

      addNoteToWall(content, new Date());

      try {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      } catch (error) {
        const notes = Utils.loadFromLocalStorage("loveNotes", []);
        notes.push({ content, date: new Date() });
        Utils.saveToLocalStorage("loveNotes", notes);
      }

      DOM.noteInput.value = "";
      launchConfetti();
    });

    loadNotes();
  }

  // Voice messages function removed

  // ========================================
  //  MAIN INITIALIZATION
  // ========================================
  function init() {
    // AUTO-RESET ALL FEATURES ON PAGE LOAD
    Utils.resetFeaturesOnLoad();

    // Initialize all features
    initPreloader();
    initStars();
    initFloatingHearts();
    initScrollAnimations();
    initProgressBar();
    initCameraModal();
    initBlowCandles();
    initTypewriter();
    initAgeCounter();
    initBalloonPop();
    initHeartGame();
    initLoveMeter();
    initLoveLetter();
    initSpinWheel();
    initScratchCard();
    initCarousel();
    initComplimentGenerator();
    initWishStar();
    initProposal();
    initVideoMessage();
    initReplyRecording();
    initLiveClock();
    initOpenWhen();
    initLoveJar();
    initMusicPlayer();
    initCursor();
    initParallax();
    initFinalAutoSave();

    // Initialize new features
    initLoveCalculator();
    initGiftBox();
    initRoseGarden();
    initMilestones();
    initLoveNotes();
    // Voice messages removed

    // Cleanup on unload
    window.addEventListener("beforeunload", () => {
      RecordingManager.stopMainRecording();
    });
  }

  // Start everything when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
