// webgl.js - Optimized 3D Background Engine for Shikhu's Birthday 💙
// Features: Particle system, mouse parallax, scroll effects, performance optimized

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

    // Particle settings
    PARTICLES: {
      COUNT: window.innerWidth < 768 ? 2000 : 3500, // Fewer on mobile
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
      FRAME_SKIP: false,
      ENABLE_FOG: true,
    },
  };

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

    // ========== SCENE SETUP ==========
    const scene = new THREE.Scene();

    // Add fog for depth effect (optional)
    if (CONFIG.PERFORMANCE.ENABLE_FOG) {
      scene.fog = new THREE.FogExp2(CONFIG.FOG.COLOR, CONFIG.FOG.DENSITY);
    }

    // ========== CAMERA SETUP ==========
    const camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      CONFIG.CAMERA.NEAR,
      CONFIG.CAMERA.FAR,
    );
    camera.position.z = CONFIG.CAMERA.START_Z;

    // ========== RENDERER SETUP ==========
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, CONFIG.PERFORMANCE.MAX_PIXEL_RATIO),
    );
    renderer.setClearColor(0x000000, 0); // Transparent background

    // ========== CREATE PARTICLES ==========
    const { particlesMesh, boundingSphere } = createParticleSystem();

    // Add to scene
    scene.add(particlesMesh);
    scene.add(boundingSphere);

    // Add a few extra floating particles for variety
    const extraParticles = createExtraParticles();
    scene.add(extraParticles);

    // ========== MOUSE INTERACTION ==========
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      windowHalfX: window.innerWidth / 2,
      windowHalfY: window.innerHeight / 2,
    };

    // Throttled mouse move handler for better performance
    let mouseMoveTimeout;
    document.addEventListener("mousemove", (event) => {
      if (mouseMoveTimeout) return;

      mouseMoveTimeout = setTimeout(() => {
        mouse.x = event.clientX - mouse.windowHalfX;
        mouse.y = event.clientY - mouse.windowHalfY;
        mouseMoveTimeout = null;
      }, 16); // ~60fps throttle
    });

    // ========== SCROLL INTERACTION ==========
    let scrollY = 0;
    let targetScrollY = 0;

    // Smooth scroll handling
    window.addEventListener(
      "scroll",
      () => {
        targetScrollY = window.scrollY;
      },
      { passive: true },
    );

    // ========== ANIMATION LOOP ==========
    const clock = new THREE.Clock();
    let animationFrameId = null;
    let lastTime = performance.now();
    let frameCount = 0;

    const tick = () => {
      // Performance monitoring - skip frames if needed
      const now = performance.now();
      const deltaTime = now - lastTime;

      // If frame takes too long (>50ms), skip visual effects
      const shouldOptimize = deltaTime > 50;
      lastTime = now;

      // Pause if tab is hidden
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      const elapsedTime = clock.getElapsedTime();

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.1;

      // Update animations
      updateParticles(
        particlesMesh,
        boundingSphere,
        elapsedTime,
        scrollY,
        mouse,
        shouldOptimize,
      );

      // Update extra particles
      updateExtraParticles(extraParticles, elapsedTime);

      // Render scene
      renderer.render(scene, camera);

      // Continue loop
      animationFrameId = requestAnimationFrame(tick);
    };

    // ========== PARTICLE SYSTEM CREATION ==========
    function createParticleSystem() {
      const particlesGeometry = new THREE.BufferGeometry();

      const posArray = new Float32Array(CONFIG.PARTICLES.COUNT * 3);
      const colorArray = new Float32Array(CONFIG.PARTICLES.COUNT * 3);

      const colorValues = Object.values(CONFIG.COLORS);

      for (let i = 0; i < CONFIG.PARTICLES.COUNT * 3; i += 3) {
        // Create more interesting distribution - mix of sphere and cube
        if (Math.random() > 0.7) {
          // Spherical distribution for center cluster
          const radius = Math.random() * 200;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
          posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta) * 1.5; // Stretch vertically
          posArray[i + 2] = radius * Math.cos(phi);
        } else {
          // Cubic distribution for outer area
          posArray[i] = (Math.random() - 0.5) * CONFIG.PARTICLES.SPREAD.x;
          posArray[i + 1] = (Math.random() - 0.5) * CONFIG.PARTICLES.SPREAD.y;
          posArray[i + 2] = (Math.random() - 0.5) * CONFIG.PARTICLES.SPREAD.z;
        }

        // Random color with weighted distribution (more blues)
        const colorIndex =
          Math.random() > 0.6
            ? Math.floor(Math.random() * colorValues.length)
            : Math.floor(Math.random() * 2); // Prefer primary and accent

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

      // Create material with size attenuation for depth effect
      const particlesMaterial = new THREE.PointsMaterial({
        size: CONFIG.PARTICLES.SIZE,
        vertexColors: true,
        transparent: true,
        opacity: CONFIG.PARTICLES.OPACITY,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial,
      );

      // Create geometric structure
      const geoMesh = new THREE.IcosahedronGeometry(150, 1);
      const geoMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.primary,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
      });
      const boundingSphere = new THREE.Mesh(geoMesh, geoMaterial);

      return { particlesMesh, boundingSphere };
    }

    // ========== EXTRA FLOATING PARTICLES ==========
    function createExtraParticles() {
      const geometry = new THREE.BufferGeometry();
      const count = 500;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i += 3) {
        // Create a ring of particles
        const angle = (i / 3) * ((Math.PI * 2) / count);
        const radius = 300;

        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = Math.sin(angle) * radius * 0.3; // Flatten vertically
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
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geometry, material);
    }

    // ========== UPDATE FUNCTIONS ==========
    function updateParticles(
      particlesMesh,
      boundingSphere,
      elapsedTime,
      scrollY,
      mouse,
      shouldOptimize,
    ) {
      // Base rotations
      particlesMesh.rotation.y = elapsedTime * CONFIG.ROTATION.PARTICLES_Y;

      if (!shouldOptimize) {
        particlesMesh.rotation.x = elapsedTime * CONFIG.ROTATION.PARTICLES_X;
        boundingSphere.rotation.y = elapsedTime * CONFIG.ROTATION.SPHERE_Y;
        boundingSphere.rotation.x = elapsedTime * CONFIG.ROTATION.SPHERE_X;
      }

      // Mouse parallax (smooth interpolation)
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

      // Camera moves forward slightly on scroll
      camera.position.z =
        CONFIG.CAMERA.START_Z - scrollY * CONFIG.CAMERA.SCROLL_SPEED;

      // Particles move up for parallax effect
      particlesMesh.position.y = scrollFactor * 0.5;
      boundingSphere.position.y = scrollFactor * 0.3;

      // Add subtle pulsing based on scroll
      const pulseScale = 1 + Math.sin(elapsedTime * 2) * 0.02;
      particlesMesh.scale.set(pulseScale, pulseScale, pulseScale);
    }

    function updateExtraParticles(particles, elapsedTime) {
      particles.rotation.y += 0.001;
      particles.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;
    }

    // ========== START ANIMATION ==========
    function startAnimation() {
      if (!document.hidden) {
        tick();
      }
    }

    startAnimation();

    // ========== VISIBILITY HANDLER ==========
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        startAnimation();
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    });

    // ========== RESIZE HANDLER ==========
    let resizeTimeout;
    window.addEventListener("resize", () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Update mouse half values
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

        // Adjust particle count for mobile/desktop
        if (window.innerWidth < 768 && CONFIG.PARTICLES.COUNT > 2000) {
          // We can't easily change particle count after creation,
          // but we can adjust visibility or quality settings
        }
      }, 250);
    });

    // ========== CLEANUP ==========
    window.addEventListener("beforeunload", () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Dispose of geometries and materials to prevent memory leaks
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
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

  // ========== FALLBACK FOR MOBILE ==========
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  // ========== INITIALIZE ==========
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // For mobile devices with weaker GPUs, reduce particle count
      if (isMobileDevice()) {
        CONFIG.PARTICLES.COUNT = 1500;
        CONFIG.PARTICLES.SIZE = 1.0;
      }
      initWebGL();
    });
  } else {
    // DOM already loaded
    setTimeout(() => {
      if (isMobileDevice()) {
        CONFIG.PARTICLES.COUNT = 1500;
        CONFIG.PARTICLES.SIZE = 1.0;
      }
      initWebGL();
    }, 100);
  }
})();
