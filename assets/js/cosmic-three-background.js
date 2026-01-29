/**
 * Three.js Cosmic Background – Stars, Constellations, Waves, Lightning
 * Interactive mouse repulsion, twinkling, shooting stars-ish, random lightning
 */

(function () {
  'use strict';

  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e23); // deep space

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 50);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Mouse tracking
  const mouse = new THREE.Vector2();
  let mouseWorld = new THREE.Vector3();

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ─── Stars (Particle System) ────────────────────────────────────────────────
  const starCount = 1800;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 800;
    positions[i3 + 1] = (Math.random() - 0.5) * 800;
    positions[i3 + 2] = (Math.random() - 0.5) * 800;

    sizes[i] = Math.random() * 2.5 + 0.8;

    // Slight blue-white variation
    const brightness = Math.random() * 0.4 + 0.6;
    colors[i3]     = brightness;
    colors[i3 + 1] = brightness * (0.9 + Math.random() * 0.2);
    colors[i3 + 2] = 1;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
  starGeometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 2.5,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ─── Simple Constellation Lines (connect nearby stars) ──────────────────────
  // For perf, we connect a subset or use instanced lines – here a basic version
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x6495ed,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending
  });

  const lineGroup = new THREE.Group();
  scene.add(lineGroup);

  function updateConstellations() {
    // Clear old lines
    while (lineGroup.children.length) {
      lineGroup.remove(lineGroup.children[0]);
    }

    const posArray = starGeometry.attributes.position.array;

    for (let i = 0; i < starCount; i += 3) {  // step to reduce connections
      const x1 = posArray[i*3], y1 = posArray[i*3+1], z1 = posArray[i*3+2];

      for (let j = i + 3; j < starCount; j += 3) {
        const x2 = posArray[j*3], y2 = posArray[j*3+1], z2 = posArray[j*3+2];
        const dist = Math.hypot(x2-x1, y2-y1, z2-z1);

        if (dist < 80 && Math.random() < 0.08) {  // sparse connections
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1,y1,z1),
            new THREE.Vector3(x2,y2,z2)
          ]);
          const line = new THREE.Line(geometry, lineMaterial);
          lineGroup.add(line);
        }
      }
    }
  }

  // Call once or on interval – heavy, so not every frame
  updateConstellations(); // initial
  setInterval(updateConstellations, 15000); // refresh occasionally

  // ─── Wavy Cosmic Plane (bottom waves) ───────────────────────────────────────
  const planeGeo = new THREE.PlaneGeometry(600, 600, 120, 120);
  const planeMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      mouse: { value: new THREE.Vector2() }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin(pos.x * 0.03 + time * 1.2) * 8.0 +
                     sin(pos.y * 0.04 + time * 0.9) * 6.0;
        pos.z += wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      void main() {
        vec3 color = mix(
          vec3(0.08, 0.12, 0.35),
          vec3(0.28, 0.45, 0.85),
          sin(vUv.x * 10.0 + time * 0.5) * 0.5 + 0.5
        );
        gl_FragColor = vec4(color, 0.18);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2.2;
  plane.position.y = -80;
  scene.add(plane);

  // ─── Lightning (simple animated line bolt) ──────────────────────────────────
  let lightning = null;
  let lightningTime = 0;

  function createLightning() {
    if (lightning) scene.remove(lightning);

    const points = [];
    let x = (Math.random() - 0.5) * 400;
    let y = 300;
    const steps = 25 + Math.floor(Math.random() * 15);

    for (let i = 0; i < steps; i++) {
      points.push(new THREE.Vector3(x, y, (Math.random() - 0.5) * 100));
      x += (Math.random() - 0.5) * 40;
      y -= 20 + Math.random() * 15;
      if (Math.random() < 0.35) { // branch
        const branchPoints = [points[points.length-1]];
        let bx = x, by = y;
        for (let b = 0; b < 8; b++) {
          bx += (Math.random() - 0.5) * 30;
          by -= 10 + Math.random() * 10;
          branchPoints.push(new THREE.Vector3(bx, by, (Math.random() - 0.5)*80));
        }
        const branchGeo = new THREE.BufferGeometry().setFromPoints(branchPoints);
        const branch = new THREE.Line(branchGeo, new THREE.LineBasicMaterial({
          color: 0xa0c0ff,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        }));
        scene.add(branch);
        setTimeout(() => scene.remove(branch), 800);
      }
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    lightning = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: 0xc8dcff,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    }));
    scene.add(lightning);

    lightningTime = 0;
  }

  // Random lightning chance
  setInterval(() => {
    if (Math.random() < 0.008) createLightning();
  }, 1000);

  // ─── Animation Loop ─────────────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Gentle starfield drift
    stars.rotation.y += 0.0001;

    // Mouse influence (repulsion / attraction feel)
    mouseWorld.set(mouse.x * 80, mouse.y * 50, 40);
    camera.lookAt(mouseWorld.lerp(new THREE.Vector3(0,0,0), 0.05));

    // Update plane shader
    planeMat.uniforms.time.value = time;
    planeMat.uniforms.mouse.value.set(mouse.x, mouse.y);

    // Lightning flash/fade
    if (lightning) {
      lightningTime += 0.016;
      lightning.material.opacity = Math.max(0, 1 - lightningTime * 2);
      if (lightningTime > 0.8) {
        scene.remove(lightning);
        lightning = null;
      }
    }

    renderer.render(scene, camera);
  }

  animate();
})();