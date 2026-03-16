// webgl.js - Optimized 3D Background Engine for Shikhu's Birthday 💙
// Features: Particle system, mouse parallax, scroll effects, performance optimized
// FINAL PRODUCTION VERSION - ALL BUGS FIXED

(function () {
  "use strict";

  // ========== CONFIGURATION ==========
  const CONFIG = {
    // Colors matching CSS variables
    COLORS: {
      primary: new THREE.Color("#1e90ff"),
      accent: new THREE.Color("#00d4ff"),
      pink: new THREE.Color("#ff6b9d"),
      gold: new THREE.Color("#ffd700"),
      white: new THREE.Color("#ffffff"),
    },

    // Particle settings - adjusted for performance
    PARTICLES: {
      COUNT: window.innerWidth < 768 ? 1500 : 3000, // Optimized count
      SIZE: 1.2,
      OPACITY: 0.8,
      SPREAD: {
        x: 500,
        y: 800,
        z: 500,
      },
    },

    // Camera settings
    CAMERA: {
      FOV: 75,
      NEAR: 0.1,
      FAR: 1000,
      START_Z: 120,
      MOUSE_SENSITIVITY: 0.0005,
      ROTATION_SPEED: 0.05,
      SCROLL_SPEED: 0.01,
    },

    // Rotation speeds
    ROTATION: {
      PARTICLES_Y: 0.03,
      PARTICLES_X: 0.01,
      SPHERE_Y: -0.02,
      SPHERE_X: 0.01,
    },

    // Fog settings
    FOG: {
      COLOR: 0x0a0e1a,
      DENSITY: 0.002,
    },

    // Performance
    PERFORMANCE: {
      MAX_PIXEL_RATIO: 2,
      ENABLE_FOG: true,
      MOUSE_THROTTLE: 16, // ms
      RESIZE_DEBOUNCE: 250, // ms
    },
  };

  // ========== GLOBAL VARIABLES ==========
  let scene, camera, renderer;
  let particlesMesh, boundingSphere, extraParticles;
  let animationFrameId = null;
  let mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    windowHalfX: window.innerWidth / 2,
    windowHalfY: window.innerHeight / 2,
  };
  let scrollY = 0;
  let targetScrollY = 0;
  let clock = new THREE.Clock();

  // ========== INITIALIZATION ==========
  function initWebGL() {
    const canvas = document.querySelector("#webgl-bg");
    if (!canvas) {
      console.warn("WebGL canvas not found");
      return;
    }

    // Check WebGL support
    if (!checkWebGLSupport()) {
      console.warn("WebGL not supported, falling back to CSS background");
      canvas.style.display = "none";
      document.body.style.background =
        "radial-gradient(circle at center, #0a0e1a, #000)";
      return;
    }

    // Setup scene, camera, renderer
    if (!setupScene(canvas)) return;

    // Create particles
    createParticleSystem();

    // Setup event listeners
    setupEventListeners();

    // Start animation
    startAnimation();

    // Handle cleanup
    setupCleanup();
  }

  // ========== SCENE SETUP ==========
  function setupScene(canvas) {
    try {
      // Scene
      scene = new THREE.Scene();

      // Fog for depth
      if (CONFIG.PERFORMANCE.ENABLE_FOG) {
        scene.fog = new THREE.FogExp2(CONFIG.FOG.COLOR, CONFIG.FOG.DENSITY);
      }

      // Camera
      camera = new THREE.PerspectiveCamera(
        CONFIG.CAMERA.FOV,
        window.innerWidth / window.innerHeight,
        CONFIG.CAMERA.NEAR,
        CONFIG.CAMERA.FAR,
      );
      camera.position.z = CONFIG.CAMERA.START_Z;

      // Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, CONFIG.PERFORMANCE.MAX_PIXEL_RATIO),
      );
      renderer.setClearColor(0x000000, 0);

      return true;
    } catch (error) {
      console.error("Failed to setup WebGL scene:", error);
      return false;
    }
  }

  // ========== PARTICLE SYSTEM CREATION ==========
  function createParticleSystem() {
    try {
      // Main particles
      const particlesGeometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(CONFIG.PARTICLES.COUNT * 3);
      const colorArray = new Float32Array(CONFIG.PARTICLES.COUNT * 3);

      const colorValues = Object.values(CONFIG.COLORS);

      for (let i = 0; i < CONFIG.PARTICLES.COUNT * 3; i += 3) {
        // Mixed distribution - sphere and cube
        if (Math.random() > 0.7) {
          // Spherical for center cluster
          const radius = Math.random() * 200;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
          posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta) * 1.5;
          posArray[i + 2] = radius * Math.cos(phi);
        } else {
          // Cubic for outer area
          posArray[i] = (Math.random() - 0.5) * CONFIG.PARTICLES.SPREAD.x;
          posArray[i + 1] = (Math.random() - 0.5) * CONFIG.PARTICLES.SPREAD.y;
          posArray[i + 2] = (Math.random() - 0.5) * CONFIG.PARTICLES.SPREAD.z;
        }

        // Weighted colors (more blues)
        const colorIndex =
          Math.random() > 0.6
            ? Math.floor(Math.random() * colorValues.length)
            : Math.floor(Math.random() * 2);

        const rColor = colorValues[colorIndex];
        colorArray[i] = rColor.r;
        colorArray[i + 1] = rColor.g;
        colorArray[i + 2] = rColor.b;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3),
      );
      particlesGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colorArray, 3),
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: CONFIG.PARTICLES.SIZE,
        vertexColors: true,
        transparent: true,
        opacity: CONFIG.PARTICLES.OPACITY,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      // Geometric structure
      const geoMesh = new THREE.IcosahedronGeometry(150, 1);
      const geoMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.primary,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
      });
      boundingSphere = new THREE.Mesh(geoMesh, geoMaterial);
      scene.add(boundingSphere);

      // Extra floating particles (ring)
      createExtraParticles();
    } catch (error) {
      console.error("Failed to create particle system:", error);
    }
  }

  // ========== EXTRA FLOATING PARTICLES ==========
  function createExtraParticles() {
    try {
      const geometry = new THREE.BufferGeometry();
      const count = 300; // Reduced for performance
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i += 3) {
        const angle = (i / 3) * ((Math.PI * 2) / count);
        const radius = 300;

        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = Math.sin(angle) * radius * 0.3;
        positions[i + 2] = Math.sin(angle) * radius * 0.5;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );

      const material = new THREE.PointsMaterial({
        size: 0.8,
        color: CONFIG.COLORS.accent,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      });

      extraParticles = new THREE.Points(geometry, material);
      scene.add(extraParticles);
    } catch (error) {
      console.error("Failed to create extra particles:", error);
    }
  }

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    // Mouse move with throttle
    let mouseMoveTimeout;
    window.addEventListener(
      "mousemove",
      (event) => {
        if (mouseMoveTimeout) return;

        mouseMoveTimeout = setTimeout(() => {
          mouse.x = event.clientX - mouse.windowHalfX;
          mouse.y = event.clientY - mouse.windowHalfY;
          mouseMoveTimeout = null;
        }, CONFIG.PERFORMANCE.MOUSE_THROTTLE);
      },
      { passive: true },
    );

    // Scroll with passive option
    window.addEventListener(
      "scroll",
      () => {
        targetScrollY = window.scrollY;
      },
      { passive: true },
    );

    // Resize with debounce
    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          handleResize();
        }, CONFIG.PERFORMANCE.RESIZE_DEBOUNCE);
      },
      { passive: true },
    );

    // Visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  // ========== RESIZE HANDLER ==========
  function handleResize() {
    if (!camera || !renderer) return;

    // Update mouse reference
    mouse.windowHalfX = window.innerWidth / 2;
    mouse.windowHalfY = window.innerHeight / 2;

    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, CONFIG.PERFORMANCE.MAX_PIXEL_RATIO),
    );
  }

  // ========== VISIBILITY HANDLER ==========
  function handleVisibilityChange() {
    if (document.hidden) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else {
      startAnimation();
    }
  }

  // ========== ANIMATION LOOP ==========
  function startAnimation() {
    if (!document.hidden && !animationFrameId) {
      tick();
    }
  }

  function tick() {
    if (document.hidden) {
      animationFrameId = requestAnimationFrame(tick);
      return;
    }

    try {
      const elapsedTime = clock.getElapsedTime();

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.1;

      // Update animations
      updateParticles(elapsedTime);
      updateExtraParticles(elapsedTime);

      // Render
      renderer.render(scene, camera);

      // Continue loop
      animationFrameId = requestAnimationFrame(tick);
    } catch (error) {
      console.error("Animation error:", error);
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  // ========== UPDATE FUNCTIONS ==========
  function updateParticles(elapsedTime) {
    if (!particlesMesh || !boundingSphere) return;

    // Base rotations
    particlesMesh.rotation.y = elapsedTime * CONFIG.ROTATION.PARTICLES_Y;
    particlesMesh.rotation.x = elapsedTime * CONFIG.ROTATION.PARTICLES_X * 0.5;

    boundingSphere.rotation.y = elapsedTime * CONFIG.ROTATION.SPHERE_Y;
    boundingSphere.rotation.x = elapsedTime * CONFIG.ROTATION.SPHERE_X * 0.3;

    // Mouse parallax
    mouse.targetX +=
      (mouse.x * CONFIG.CAMERA.MOUSE_SENSITIVITY - mouse.targetX) * 0.05;
    mouse.targetY +=
      (mouse.y * CONFIG.CAMERA.MOUSE_SENSITIVITY - mouse.targetY) * 0.05;

    camera.rotation.y +=
      CONFIG.CAMERA.ROTATION_SPEED * (mouse.targetX - camera.rotation.y);
    camera.rotation.x +=
      CONFIG.CAMERA.ROTATION_SPEED * (mouse.targetY - camera.rotation.x);

    // Scroll effects
    const scrollFactor = scrollY * 0.05;

    camera.position.z =
      CONFIG.CAMERA.START_Z - scrollY * CONFIG.CAMERA.SCROLL_SPEED;

    particlesMesh.position.y = scrollFactor * 0.5;
    boundingSphere.position.y = scrollFactor * 0.3;

    // Subtle pulsing
    const pulseScale = 1 + Math.sin(elapsedTime * 2) * 0.01;
    particlesMesh.scale.set(pulseScale, pulseScale, pulseScale);
  }

  function updateExtraParticles(elapsedTime) {
    if (!extraParticles) return;

    extraParticles.rotation.y += 0.001;
    extraParticles.rotation.x = Math.sin(elapsedTime * 0.5) * 0.05;
  }

  // ========== CLEANUP ==========
  function setupCleanup() {
    window.addEventListener("beforeunload", () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // Dispose resources
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((m) => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (renderer) renderer.dispose();
    });
  }

  // ========== WEBGL SUPPORT CHECK ==========
  function checkWebGLSupport() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!(gl && gl instanceof WebGLRenderingContext);
    } catch (e) {
      return false;
    }
  }

  // ========== MOBILE DETECTION ==========
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  // ========== ADJUST FOR MOBILE ==========
  function adjustForMobile() {
    if (isMobileDevice()) {
      CONFIG.PARTICLES.COUNT = 1000;
      CONFIG.PARTICLES.SIZE = 1.0;
      CONFIG.PERFORMANCE.ENABLE_FOG = false;
    }
  }

  // ========== INITIALIZE ==========
  function init() {
    adjustForMobile();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initWebGL);
    } else {
      // Small delay to ensure DOM is fully ready
      setTimeout(initWebGL, 50);
    }
  }

  // Start everything
  init();
})();
