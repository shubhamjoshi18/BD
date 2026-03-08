// webgl.js - 3D Background Engine for Birthday Website

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scene Setup
    const canvas = document.querySelector('#webgl-bg');
    if (!canvas) return;

    const scene = new THREE.Scene();
    // Add fog to make particles fade out in the distance
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.002);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // Start camera pushed back
    camera.position.z = 120;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent to blend with CSS #000
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Create Particles (Premium Star/Dust Field)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3500; // High count for wow factor

    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    // Color palette matching the CSS variables (Primary, Accent, Pink, Gold)
    const colorHexes = [
        new THREE.Color('#1e90ff'), // primary
        new THREE.Color('#00d4ff'), // accent
        new THREE.Color('#ff6b9d'), // pink
        new THREE.Color('#ffd700'), // gold
        new THREE.Color('#ffffff')  // white
    ];

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Random spherical/cubic distribution spread across a large area
        posArray[i] = (Math.random() - 0.5) * 500; // x
        posArray[i + 1] = (Math.random() - 0.5) * 800; // y (taller for scrolling)
        posArray[i + 2] = (Math.random() - 0.5) * 500; // z

        // Assign random color from palette
        const rColor = colorHexes[Math.floor(Math.random() * colorHexes.length)];
        colorArray[i] = rColor.r;
        colorArray[i + 1] = rColor.g;
        colorArray[i + 2] = rColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Premium glowing particles
    const particlesMaterial = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // Makes overlapping particles brighter
        depthWrite: false // Prevents particles from occluding each other weirdly
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add a secondary subtle geometric mesh for more structure (like Sébastien Lempens)
    const geoMesh = new THREE.IcosahedronGeometry(150, 1);
    const geoMaterial = new THREE.MeshBasicMaterial({
        color: 0x1e90ff,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
    });
    const boundingSphere = new THREE.Mesh(geoMesh, geoMaterial);
    scene.add(boundingSphere);


    // 5. Mouse Interaction Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // 6. Scroll Interaction Variables
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // 7. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId = null;

    const tick = () => {
        if (document.hidden) return;

        const elapsedTime = clock.getElapsedTime();

        // Slowly rotate entire particle system automatically
        particlesMesh.rotation.y = elapsedTime * 0.03;
        particlesMesh.rotation.x = elapsedTime * 0.01;
        boundingSphere.rotation.y = elapsedTime * -0.02;
        boundingSphere.rotation.x = elapsedTime * 0.01;

        // Smoothly interpolate mouse movement (Lerp)
        targetX = mouseX * 0.0005;
        targetY = mouseY * 0.0005;

        // Camera parallax based on mouse
        camera.rotation.y += 0.05 * (targetX - camera.rotation.y);
        camera.rotation.x += 0.05 * (targetY - camera.rotation.x);

        // Scroll effect: move particles up as we scroll
        // And push camera slightly into the scene
        const scrollFactor = scrollY * 0.05;

        // As user scrolls down, camera moves forward
        camera.position.z = 120 - (scrollY * 0.01);

        // Particles move up, giving sense of falling/descending
        particlesMesh.position.y = scrollFactor * 0.5;
        boundingSphere.position.y = scrollFactor * 0.3;

        // Render
        renderer.render(scene, camera);

        // Continue loop
        animationFrameId = requestAnimationFrame(tick);
    };

    // Start loop if visible
    if (!document.hidden) {
        tick();
    }

    // Optimize: Pause WebGL when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            tick();
        } else if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });

    // 8. Resize Handler
    window.addEventListener('resize', () => {
        // Update variables
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        // Update Camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update Renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
});
