import * as THREE from "./vendor/three.module.min.js";

const container = document.querySelector("#workshop-scene");
const canvas = document.querySelector("#workshop-canvas");

if (!container || !canvas) {
  throw new Error("Portfolio vault mount is missing.");
}

const projectMeta = {
  agent: {
    index: "01 / 08",
    title: "Agent Loop Guard",
    description:
      "Safety, permissions, replay, benchmarks, and isolated execution for coding agents.",
    href: "./agent-loop-guard.html",
    image: "./assets/agent-loop-guard-dashboard.png",
    accent: 0xb7f34a,
    code: "AGENT SAFETY SYSTEM",
  },
  citypulse: {
    index: "02 / 08",
    title: "CityPulse",
    description:
      "Hourly NYC taxi demand forecasting with rolling backtests, uncertainty, SHAP, and drift.",
    href: "./citypulse.html",
    image: "./assets/citypulse-overview.png",
    accent: 0x5ed8d0,
    code: "FORECAST ENGINE",
  },
  "repo-health": {
    index: "03 / 08",
    title: "Repo Health",
    description:
      "Private repository auditing with JSON, SARIF, standalone reports, and baselines.",
    href: "./repo-health.html",
    image: "./assets/repo-health.png",
    accent: 0xffd166,
    code: "REPOSITORY SCANNER",
  },
  config: {
    index: "04 / 08",
    title: "Config Studio",
    description:
      "Schema-driven YAML editing with visual and raw modes, diff preview, and atomic saves.",
    href: "./config-studio.html",
    image: "./assets/config-studio.png",
    accent: 0xff8066,
    code: "CONFIGURATION LAB",
  },
  api: {
    index: "05 / 08",
    title: "API Forge",
    description:
      "A local API access gateway for keys, roles, scopes, rate limits, and safe audit events.",
    href: "./api-forge.html",
    image: "./assets/api-forge.png",
    accent: 0x7b8cff,
    code: "ACCESS GATEWAY",
  },
  serverops: {
    index: "06 / 08",
    title: "ServerOps",
    description:
      "Authenticated Paper server operations with events, backups, snapshots, and bounded actions.",
    href: "./serverops.html",
    image: "./assets/serverops.png",
    accent: 0x5ed8d0,
    code: "SERVER CONTROL",
  },
  volley: {
    index: "07 / 08",
    title: "VolleyCore",
    description:
      "A Paper volleyball game system with arenas, teams, physics, techniques, bots, and scoring.",
    href: "./volleycore.html",
    image: "./assets/volleycore-ball.png",
    accent: 0xff8066,
    code: "GAMEPLAY ENGINE",
  },
  economy: {
    index: "08 / 08",
    title: "Fallen Economy",
    description:
      "Server economy systems for shops, auctions, buy orders, tools, balances, and integrations.",
    href: "./fallen-economy.html",
    image: null,
    accent: 0xffd166,
    code: "ECONOMY NETWORK",
  },
};

const projectIds = Object.keys(projectMeta);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030504);
scene.fog = new THREE.FogExp2(0x030504, 0.026);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
const cameraTarget = new THREE.Vector3(0, 2.9, -1.2);
const desiredCamera = new THREE.Vector3(0, 3.4, 12.8);
camera.position.set(0, 3.8, reducedMotion ? 12.8 : 17.5);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
} catch {
  document.body.classList.add("scene-unavailable");
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;

  const textureLoader = new THREE.TextureLoader();
  const interactiveMeshes = [];
  const projectGroups = new Map();
  const animatedRings = [];
  const runwayPulses = [];
  const carousel = new THREE.Group();
  carousel.position.z = -3.4;
  scene.add(carousel);

  const ambient = new THREE.HemisphereLight(0xbfffe6, 0x171009, 1.05);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xf5fff9, 3.2);
  keyLight.position.set(6, 12, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -12;
  keyLight.shadow.camera.right = 12;
  keyLight.shadow.camera.top = 12;
  keyLight.shadow.camera.bottom = -10;
  scene.add(keyLight);

  const portalLight = new THREE.PointLight(0xb7f34a, 48, 25, 2);
  portalLight.position.set(0, 3.2, -5.2);
  scene.add(portalLight);

  const sideLight = new THREE.PointLight(0xff8066, 28, 20, 2);
  sideLight.position.set(-7, 2.3, 2);
  scene.add(sideLight);

  const cyanLight = new THREE.PointLight(0x5ed8d0, 25, 20, 2);
  cyanLight.position.set(7, 4.5, -1);
  scene.add(cyanLight);

  createVaultArchitecture();
  const portal = createPortal();
  scene.add(portal);

  projectIds.forEach((id, index) => {
    const angle = (index / projectIds.length) * Math.PI * 2;
    const slab = createProjectSlab(id, index);
    slab.position.set(Math.sin(angle) * 6.8, 3 + (index % 2 ? 0.18 : -0.08), Math.cos(angle) * 6.8);
    slab.rotation.y = angle;
    carousel.add(slab);
    projectGroups.set(id, slab);
  });

  const pointer = new THREE.Vector2(2, 2);
  const pointerDrift = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hoveredId = null;
  let selectedId = "agent";
  let targetCarouselRotation = 0;
  let motionPaused = reducedMotion;
  let interactionPulse = 0;
  const sceneStartedAt = performance.now();

  function createVaultArchitecture() {
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x080d0a,
      roughness: 0.52,
      metalness: 0.42,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(42, 54), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.03, -7);
    floor.receiveShadow = true;
    scene.add(floor);

    const runway = new THREE.Mesh(
      new THREE.PlaneGeometry(7.4, 42),
      new THREE.MeshStandardMaterial({
        color: 0x0d1510,
        roughness: 0.3,
        metalness: 0.72,
      }),
    );
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0.01, -6);
    runway.receiveShadow = true;
    scene.add(runway);

    const grid = new THREE.GridHelper(42, 42, 0x355b49, 0x18251d);
    grid.position.set(0, 0.025, -7);
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    scene.add(grid);

    for (const x of [-3.7, 3.7]) {
      const rail = box(
        0.055,
        0.035,
        40,
        new THREE.MeshBasicMaterial({
          color: x < 0 ? 0xff8066 : 0x5ed8d0,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
        }),
      );
      rail.position.set(x, 0.08, -6);
      scene.add(rail);
    }

    for (let index = 0; index < 24; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: index % 3 === 0 ? 0xb7f34a : 0x345748,
        transparent: true,
        opacity: index % 3 === 0 ? 0.86 : 0.28,
        blending: THREE.AdditiveBlending,
      });
      const pulse = box(5.4, 0.025, 0.045, material);
      pulse.position.set(0, 0.065, 9 - index * 1.42);
      pulse.userData.offset = index * 0.73;
      scene.add(pulse);
      runwayPulses.push(pulse);
    }

    const structureMaterial = new THREE.MeshStandardMaterial({
      color: 0x111713,
      roughness: 0.36,
      metalness: 0.76,
    });
    for (const z of [-13, -8, -3, 2, 7]) {
      for (const x of [-8.2, 8.2]) {
        const pillar = box(0.28, 8.8, 0.42, structureMaterial);
        pillar.position.set(x, 4.35, z);
        pillar.castShadow = true;
        scene.add(pillar);

        const marker = box(
          0.08,
          5.8,
          0.08,
          new THREE.MeshBasicMaterial({
            color: x < 0 ? 0xff8066 : 0x5ed8d0,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
          }),
        );
        marker.position.set(x - Math.sign(x) * 0.22, 4.1, z + 0.25);
        scene.add(marker);
      }
      const beam = box(16.7, 0.28, 0.42, structureMaterial);
      beam.position.set(0, 8.72, z);
      beam.castShadow = true;
      scene.add(beam);
    }

    const leftSign = createSign("BUILD / BREAK", "SYSTEMS IN MOTION", 0xff8066);
    leftSign.position.set(-7.75, 4.8, -1.5);
    leftSign.rotation.y = Math.PI / 2;
    scene.add(leftSign);

    const rightSign = createSign("SHIP / REPEAT", "ARCHIVE VOL. 01", 0x5ed8d0);
    rightSign.position.set(7.75, 4.8, -5);
    rightSign.rotation.y = -Math.PI / 2;
    scene.add(rightSign);
  }

  function createPortal() {
    const group = new THREE.Group();
    group.position.set(0, 3.4, -5.2);

    [
      [5.35, 0.075, 0xb7f34a, 0.72],
      [4.82, 0.035, 0x5ed8d0, 0.78],
      [4.38, 0.055, 0xff8066, 0.68],
    ].forEach(([radius, thickness, color, opacity], index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, thickness, 10, 180),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.position.z = -index * 0.16;
      group.add(ring);
      animatedRings.push({ object: ring, speed: index % 2 ? -0.035 : 0.025 });
    });

    for (let index = 0; index < 28; index += 1) {
      const angle = (index / 28) * Math.PI * 2;
      const tick = box(
        index % 4 === 0 ? 0.09 : 0.045,
        index % 4 === 0 ? 0.62 : 0.31,
        0.04,
        new THREE.MeshBasicMaterial({
          color: index % 4 === 0 ? 0xb7f34a : 0x4f7865,
          transparent: true,
          opacity: index % 4 === 0 ? 0.85 : 0.45,
          blending: THREE.AdditiveBlending,
        }),
      );
      tick.position.set(Math.sin(angle) * 5.85, Math.cos(angle) * 5.85, -0.1);
      tick.rotation.z = -angle;
      group.add(tick);
    }

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(3.9, 96),
      new THREE.MeshBasicMaterial({
        color: 0x07100b,
        transparent: true,
        opacity: 0.62,
      }),
    );
    core.position.z = -0.24;
    group.add(core);

    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.35),
      new THREE.MeshBasicMaterial({
        map: makeTextTexture("RD//VAULT", "INDEPENDENT SYSTEM ARCHIVE", 0xb7f34a),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    logo.position.z = -0.12;
    group.add(logo);
    return group;
  }

  function createProjectSlab(id, index) {
    const meta = projectMeta[id];
    const group = new THREE.Group();
    group.userData.projectId = id;
    group.userData.baseY = 3 + (index % 2 ? 0.18 : -0.08);
    group.userData.scanner = null;
    group.userData.glowMaterials = [];

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x111713,
      roughness: 0.28,
      metalness: 0.78,
      emissive: new THREE.Color(meta.accent).multiplyScalar(0.05),
      emissiveIntensity: 0.55,
    });
    const frame = box(4.72, 3.3, 0.2, frameMaterial);
    frame.castShadow = true;
    group.add(frame);

    const backing = box(
      4.46,
      3.04,
      0.16,
      new THREE.MeshStandardMaterial({
        color: 0x050806,
        roughness: 0.2,
        metalness: 0.7,
      }),
    );
    backing.position.z = 0.12;
    group.add(backing);

    const imageTexture = meta.image ? loadTexture(meta.image) : makeArtifactTexture(meta);
    const screenMaterial = new THREE.MeshBasicMaterial({
      map: imageTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.22, 2.38), screenMaterial);
    screen.position.set(0, 0.17, 0.215);
    screen.userData.projectId = id;
    group.add(screen);
    interactiveMeshes.push(screen);

    const tintMaterial = new THREE.MeshBasicMaterial({
      color: meta.accent,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const tint = new THREE.Mesh(new THREE.PlaneGeometry(4.24, 2.4), tintMaterial);
    tint.position.set(0, 0.17, 0.222);
    tint.userData.projectId = id;
    group.add(tint);
    interactiveMeshes.push(tint);

    for (const x of [-2.31, 2.31]) {
      const edgeMaterial = new THREE.MeshBasicMaterial({
        color: meta.accent,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
      });
      const edge = box(0.045, 3.26, 0.08, edgeMaterial);
      edge.position.set(x, 0, 0.18);
      group.add(edge);
      group.userData.glowMaterials.push(edgeMaterial);
    }

    const scannerMaterial = new THREE.MeshBasicMaterial({
      color: meta.accent,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanner = new THREE.Mesh(new THREE.PlaneGeometry(4.18, 0.025), scannerMaterial);
    scanner.position.set(0, -1, 0.235);
    group.add(scanner);
    group.userData.scanner = scanner;

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 0.54),
      new THREE.MeshBasicMaterial({
        map: makeTextTexture(meta.title.toUpperCase(), meta.code, meta.accent),
        transparent: true,
        toneMapped: false,
      }),
    );
    label.position.set(0, -1.72, 0.18);
    label.userData.projectId = id;
    group.add(label);
    interactiveMeshes.push(label);

    const number = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.28),
      new THREE.MeshBasicMaterial({
        map: makeTextTexture(String(index + 1).padStart(2, "0"), "ARCHIVE", meta.accent, 512, 196),
        transparent: true,
        toneMapped: false,
      }),
    );
    number.position.set(-1.75, 1.88, 0.17);
    group.add(number);

    const glow = new THREE.PointLight(meta.accent, 8, 7, 2);
    glow.position.set(0, 0, 1.1);
    group.add(glow);
    group.userData.glow = glow;
    group.userData.screenMaterial = screenMaterial;
    group.userData.tintMaterial = tintMaterial;
    return group;
  }

  function createSign(title, subtitle, color) {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({
        map: makeTextTexture(title, subtitle, color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
  }

  function makeTextTexture(title, subtitle, color, width = 1024, height = 256) {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = width;
    labelCanvas.height = height;
    const context = labelCanvas.getContext("2d");
    const accent = `#${color.toString(16).padStart(6, "0")}`;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(3, 6, 4, 0.9)";
    context.fillRect(0, 0, width, height);
    context.fillStyle = accent;
    context.fillRect(0, 0, 13, height);
    context.strokeStyle = accent;
    context.lineWidth = 3;
    context.strokeRect(2, 2, width - 4, height - 4);
    context.fillStyle = "#f5faf5";
    context.font = `900 ${Math.floor(height * 0.31)}px Segoe UI, Arial`;
    context.textBaseline = "middle";
    context.fillText(title, 54, height * 0.43);
    context.fillStyle = accent;
    context.font = `700 ${Math.floor(height * 0.12)}px Consolas, monospace`;
    context.fillText(subtitle, 56, height * 0.74);
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    return texture;
  }

  function makeArtifactTexture(meta) {
    const artifactCanvas = document.createElement("canvas");
    artifactCanvas.width = 1200;
    artifactCanvas.height = 720;
    const context = artifactCanvas.getContext("2d");
    const accent = `#${meta.accent.toString(16).padStart(6, "0")}`;
    context.fillStyle = "#080b08";
    context.fillRect(0, 0, artifactCanvas.width, artifactCanvas.height);
    context.strokeStyle = accent;
    context.lineWidth = 4;
    for (let index = 0; index < 10; index += 1) {
      context.strokeRect(80 + index * 34, 90 + index * 22, 720, 420);
    }
    context.fillStyle = accent;
    context.font = "900 88px Segoe UI, Arial";
    context.fillText(meta.title.toUpperCase(), 110, 560);
    context.font = "700 30px Consolas, monospace";
    context.fillText(meta.code, 114, 620);
    const texture = new THREE.CanvasTexture(artifactCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function loadTexture(path) {
    return textureLoader.load(
      path,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      },
      undefined,
      () => {},
    );
  }

  function box(width, height, depth, material) {
    return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  }

  function setHighlight(id) {
    if (hoveredId === id) return;
    hoveredId = id;
    canvas.style.cursor = id ? "pointer" : "grab";
  }

  function selectProject(id, userInitiated = true) {
    const index = projectIds.indexOf(id);
    const meta = projectMeta[id];
    if (index < 0 || !meta) return;

    selectedId = id;
    targetCarouselRotation = -(index / projectIds.length) * Math.PI * 2;
    interactionPulse = 1;

    document.querySelector("#scene-index").textContent = meta.index;
    document.querySelector("#scene-title").textContent = meta.title.toUpperCase();
    document.querySelector("#scene-description").textContent = meta.description;

    const accent = `#${meta.accent.toString(16).padStart(6, "0")}`;
    document.querySelector(".workshop-hero").style.setProperty("--scene-accent", accent);
    const inspector = document.querySelector("#scene-inspector");
    inspector.style.setProperty("--scene-accent", accent);
    const link = document.querySelector("#scene-link");
    link.href = meta.href;
    link.style.setProperty("--scene-accent", accent);

    portalLight.color.setHex(meta.accent);
    animatedRings[0].object.material.color.setHex(meta.accent);

    document.querySelectorAll("[data-scene-project]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.sceneProject === id));
    });

    if (userInitiated && !reducedMotion) {
      motionPaused = false;
      motionButton.classList.remove("is-paused");
      motionButton.title = "Pause 3D motion";
      motionButton.setAttribute("aria-label", motionButton.title);
    }
  }

  document.querySelectorAll("[data-scene-project]").forEach((button) => {
    button.addEventListener("click", () => selectProject(button.dataset.sceneProject));
  });

  const motionButton = document.querySelector("#scene-motion");
  if (motionPaused) {
    motionButton.classList.add("is-paused");
    motionButton.title = "Resume 3D motion";
    motionButton.setAttribute("aria-label", motionButton.title);
  }
  motionButton.addEventListener("click", () => {
    motionPaused = !motionPaused;
    motionButton.classList.toggle("is-paused", motionPaused);
    motionButton.title = motionPaused ? "Resume 3D motion" : "Pause 3D motion";
    motionButton.setAttribute("aria-label", motionButton.title);
  });

  canvas.addEventListener("pointermove", (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    pointerDrift.set(pointer.x, pointer.y);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
    setHighlight(hit?.object.userData.projectId ?? null);
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.set(2, 2);
    pointerDrift.set(0, 0);
    setHighlight(null);
  });

  canvas.addEventListener("click", () => {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
    if (hit?.object.userData.projectId) {
      selectProject(hit.object.userData.projectId);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const currentIndex = projectIds.indexOf(selectedId);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + projectIds.length) % projectIds.length;
    selectProject(projectIds[nextIndex]);
  });

  let previousTime = performance.now();
  function render(time) {
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    const elapsed = time * 0.001;
    const intro = reducedMotion ? 1 : Math.min((time - sceneStartedAt) / 1900, 1);
    const easedIntro = 1 - Math.pow(1 - intro, 4);

    const angleDifference = Math.atan2(
      Math.sin(targetCarouselRotation - carousel.rotation.y),
      Math.cos(targetCarouselRotation - carousel.rotation.y),
    );
    carousel.rotation.y += angleDifference * (reducedMotion ? 1 : 0.075);

    const mobile = window.innerWidth < 760;
    desiredCamera.set(
      pointerDrift.x * (mobile ? 0.18 : 0.52),
      (mobile ? 3.65 : 3.4) + pointerDrift.y * (mobile ? 0.08 : 0.28),
      (mobile ? 15.1 : 12.8) + (1 - easedIntro) * 4.7 - interactionPulse * 0.35,
    );
    camera.position.lerp(desiredCamera, reducedMotion ? 1 : 0.065);
    camera.lookAt(cameraTarget);
    interactionPulse *= 0.92;

    if (!motionPaused) {
      animatedRings.forEach(({ object, speed }, index) => {
        object.rotation.z += delta * speed * (index + 2);
        object.rotation.x = Math.sin(elapsed * 0.22 + index) * 0.025;
        object.rotation.y = Math.cos(elapsed * 0.18 + index) * 0.025;
      });
      runwayPulses.forEach((pulse) => {
        pulse.material.opacity =
          0.16 + Math.max(0, Math.sin(elapsed * 2.5 - pulse.userData.offset)) * 0.72;
      });
      portalLight.intensity = 42 + Math.sin(elapsed * 2.1) * 8;
    }

    projectGroups.forEach((group, id) => {
      const selected = id === selectedId;
      const hovered = id === hoveredId;
      const targetScale = selected ? 1.16 : hovered ? 0.98 : 0.86;
      group.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        reducedMotion ? 1 : 0.12,
      );
      const localTime = elapsed + projectIds.indexOf(id) * 0.7;
      group.position.y =
        group.userData.baseY + (motionPaused ? 0 : Math.sin(localTime * 0.8) * 0.08);
      group.userData.screenMaterial.opacity +=
        ((selected ? 1 : hovered ? 0.82 : 0.48) - group.userData.screenMaterial.opacity) *
        (reducedMotion ? 1 : 0.1);
      group.userData.tintMaterial.opacity +=
        ((selected ? 0.12 : hovered ? 0.08 : 0.025) - group.userData.tintMaterial.opacity) *
        (reducedMotion ? 1 : 0.1);
      group.userData.glow.intensity +=
        ((selected ? 16 : hovered ? 9 : 3) - group.userData.glow.intensity) *
        (reducedMotion ? 1 : 0.1);
      group.userData.glowMaterials.forEach((material) => {
        material.opacity +=
          ((selected ? 1 : hovered ? 0.78 : 0.32) - material.opacity) *
          (reducedMotion ? 1 : 0.1);
      });
      if (!motionPaused) {
        group.userData.scanner.position.y = -1 + ((elapsed * 0.68 + projectIds.indexOf(id) * 0.17) % 1) * 2.35;
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.fov = width < 760 ? 57 : width < 1080 ? 46 : 40;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  resize();
  selectProject("agent", false);
  requestAnimationFrame(render);
  document.body.classList.add("scene-ready");
}
