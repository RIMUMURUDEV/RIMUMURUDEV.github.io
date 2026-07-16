import * as THREE from "./vendor/three.module.min.js";

const container = document.querySelector("#workshop-scene");
const canvas = document.querySelector("#workshop-canvas");

if (!container || !canvas) {
  throw new Error("Workshop scene mount is missing.");
}

const projectMeta = {
  agent: {
    index: "01 / 08",
    title: "Agent Loop Guard",
    description:
      "Safety, permissions, replay, benchmarks, and isolated execution for coding agents.",
    href: "./agent-loop-guard.html",
    accent: 0xb7f34a,
    cameraOffset: new THREE.Vector3(4.8, 3.5, 7.5),
  },
  citypulse: {
    index: "02 / 08",
    title: "CityPulse",
    description:
      "Hourly NYC taxi demand forecasting with rolling backtests, uncertainty, SHAP, and drift.",
    href: "./citypulse.html",
    accent: 0x5ed8d0,
    cameraOffset: new THREE.Vector3(4.7, 3.1, 7.2),
  },
  "repo-health": {
    index: "03 / 08",
    title: "Repo Health",
    description:
      "Private repository auditing with JSON, SARIF, standalone reports, and baselines.",
    href: "./repo-health.html",
    accent: 0xffd166,
    cameraOffset: new THREE.Vector3(4.2, 2.8, 6.5),
  },
  config: {
    index: "04 / 08",
    title: "Config Studio",
    description:
      "Schema-driven YAML editing with visual and raw modes, diff preview, and atomic saves.",
    href: "./config-studio.html",
    accent: 0xff8066,
    cameraOffset: new THREE.Vector3(-4.7, 3.1, 7.2),
  },
  api: {
    index: "05 / 08",
    title: "API Forge",
    description:
      "A local API access gateway for keys, roles, scopes, rate limits, and safe audit events.",
    href: "./api-forge.html",
    accent: 0x7b8cff,
    cameraOffset: new THREE.Vector3(-4.4, 3.2, 6.3),
  },
  serverops: {
    index: "06 / 08",
    title: "ServerOps",
    description:
      "Authenticated Paper server operations with events, backups, snapshots, and bounded actions.",
    href: "./serverops.html",
    accent: 0x5ed8d0,
    cameraOffset: new THREE.Vector3(-4.5, 3.5, 7.2),
  },
  volley: {
    index: "07 / 08",
    title: "VolleyCore",
    description:
      "A Paper volleyball game system with arenas, teams, physics, techniques, bots, and scoring.",
    href: "./volleycore.html",
    accent: 0xff8066,
    cameraOffset: new THREE.Vector3(-3.8, 2.6, 5.5),
  },
  economy: {
    index: "08 / 08",
    title: "Fallen Economy",
    description:
      "Server economy systems for shops, auctions, buy orders, tools, balances, and integrations.",
    href: "./fallen-economy.html",
    accent: 0xffd166,
    cameraOffset: new THREE.Vector3(3.9, 2.6, 5.6),
  },
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f0d);
scene.fog = new THREE.FogExp2(0x0b0f0d, 0.035);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const overviewPosition = new THREE.Vector3(10.5, 7.2, 15.5);
const overviewTarget = new THREE.Vector3(0, 1.4, -0.2);
camera.position.copy(overviewPosition);

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const hemi = new THREE.HemisphereLight(0xd9fff5, 0x2b2418, 1.5);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(5, 10, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -12;
  keyLight.shadow.camera.right = 12;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(0x5ed8d0, 22, 18, 2);
  cyanLight.position.set(-5, 4.8, 2);
  scene.add(cyanLight);

  const coralLight = new THREE.PointLight(0xff8066, 18, 16, 2);
  coralLight.position.set(5, 3.6, 1);
  scene.add(coralLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 24),
    new THREE.MeshStandardMaterial({ color: 0x171c18, roughness: 0.9, metalness: 0.05 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(30, 30, 0x31544a, 0x25302a);
  grid.position.y = 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  scene.add(grid);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 11),
    new THREE.MeshStandardMaterial({ color: 0x111612, roughness: 1 }),
  );
  backWall.position.set(0, 5.4, -6);
  scene.add(backWall);

  const workbench = new THREE.Group();
  const deskMaterial = new THREE.MeshStandardMaterial({
    color: 0x30362f,
    roughness: 0.72,
    metalness: 0.18,
  });
  const top = box(11.5, 0.3, 2.7, deskMaterial);
  top.position.y = 1.02;
  top.castShadow = true;
  top.receiveShadow = true;
  workbench.add(top);
  for (const x of [-5.1, 5.1]) {
    for (const z of [-0.8, 0.8]) {
      const leg = box(0.28, 2, 0.28, deskMaterial);
      leg.position.set(x, 0, z);
      leg.castShadow = true;
      workbench.add(leg);
    }
  }
  scene.add(workbench);

  const projects = new Map();
  const interactiveMeshes = [];
  const animated = [];
  const textureLoader = new THREE.TextureLoader();

  function registerProject(id, group) {
    group.userData.projectId = id;
    group.userData.baseScale = group.scale.clone();
    group.traverse((child) => {
      if (!child.isMesh) return;
      child.userData.projectId = id;
      child.castShadow = true;
      child.receiveShadow = true;
      interactiveMeshes.push(child);
    });
    projects.set(id, group);
    scene.add(group);
    return group;
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

  function createMonitor(id, image, width, height, position, rotationY = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotationY;

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x151a17,
      roughness: 0.38,
      metalness: 0.55,
    });
    const frame = box(width + 0.2, height + 0.2, 0.18, frameMaterial);
    group.add(frame);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: loadTexture(image), color: 0xffffff }),
    );
    screen.position.z = 0.101;
    group.add(screen);

    const neck = box(0.18, 0.7, 0.18, frameMaterial);
    neck.position.y = -height / 2 - 0.43;
    group.add(neck);
    const foot = box(1.1, 0.08, 0.55, frameMaterial);
    foot.position.y = -height / 2 - 0.8;
    foot.position.z = 0.06;
    group.add(foot);

    const glow = new THREE.PointLight(projectMeta[id].accent, 4.5, 5, 2);
    glow.position.set(0, 0, 0.8);
    group.add(glow);
    group.add(makeLabel(projectMeta[id].title, projectMeta[id].accent, -height / 2 - 1.04));
    animated.push({ object: glow, kind: "light", offset: projects.size * 0.7 });
    return registerProject(id, group);
  }

  createMonitor(
    "agent",
    "./assets/agent-playground.png",
    4.1,
    2.45,
    new THREE.Vector3(0, 3.15, -1.25),
  );
  createMonitor(
    "citypulse",
    "./assets/citypulse-overview.png",
    3.15,
    1.88,
    new THREE.Vector3(-4.35, 2.72, -0.8),
    0.28,
  );
  createMonitor(
    "config",
    "./assets/config-studio.png",
    3.15,
    1.88,
    new THREE.Vector3(4.35, 2.72, -0.8),
    -0.28,
  );

  const repoHealth = new THREE.Group();
  repoHealth.position.set(-5.2, 1.62, 2.25);
  repoHealth.rotation.y = 0.34;
  const clipboard = box(
    2.2,
    2.8,
    0.18,
    new THREE.MeshStandardMaterial({ color: 0xe4dfca, roughness: 0.8 }),
  );
  repoHealth.add(clipboard);
  const report = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 2.45),
    new THREE.MeshBasicMaterial({ map: loadTexture("./assets/repo-health.png") }),
  );
  report.position.z = 0.101;
  repoHealth.add(report);
  const clip = box(
    0.8,
    0.22,
    0.28,
    new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.4, roughness: 0.35 }),
  );
  clip.position.set(0, 1.42, 0.02);
  repoHealth.add(clip);
  repoHealth.add(makeLabel("Repo Health", projectMeta["repo-health"].accent, -1.75));
  registerProject("repo-health", repoHealth);

  const serverRack = new THREE.Group();
  serverRack.position.set(5.35, 1.75, -3.75);
  const rack = box(
    2.2,
    4.2,
    1.6,
    new THREE.MeshStandardMaterial({ color: 0x181d1a, roughness: 0.42, metalness: 0.65 }),
  );
  serverRack.add(rack);
  for (let index = 0; index < 7; index += 1) {
    const unit = box(
      1.82,
      0.36,
      0.1,
      new THREE.MeshStandardMaterial({
        color: index % 2 ? 0x27312c : 0x202824,
        emissive: index % 2 ? 0x073e3b : 0x1a2108,
        emissiveIntensity: 0.9,
      }),
    );
    unit.position.set(0, -1.45 + index * 0.48, 0.86);
    serverRack.add(unit);
    const indicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 8),
      new THREE.MeshBasicMaterial({ color: index % 3 ? 0x5ed8d0 : 0xb7f34a }),
    );
    indicator.position.set(0.72, unit.position.y, 0.94);
    serverRack.add(indicator);
  }
  serverRack.add(makeLabel("ServerOps", projectMeta.serverops.accent, -2.5));
  registerProject("serverops", serverRack);

  const apiForge = new THREE.Group();
  apiForge.position.set(5.55, 1.35, 2.15);
  const gatewayMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a3150,
    emissive: 0x182557,
    emissiveIntensity: 1.1,
    metalness: 0.5,
    roughness: 0.32,
  });
  const gatewayTop = box(2.2, 0.28, 0.45, gatewayMaterial);
  gatewayTop.position.y = 1.35;
  apiForge.add(gatewayTop);
  for (const x of [-0.96, 0.96]) {
    const column = box(0.28, 2.8, 0.45, gatewayMaterial);
    column.position.x = x;
    apiForge.add(column);
  }
  const apiPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 1.85),
    new THREE.MeshBasicMaterial({ map: loadTexture("./assets/api-forge.png") }),
  );
  apiPanel.position.z = 0.24;
  apiForge.add(apiPanel);
  apiForge.add(makeLabel("API Forge", projectMeta.api.accent, -1.78));
  registerProject("api", apiForge);

  const volleyball = new THREE.Group();
  volleyball.position.set(2.65, 0.78, 3.25);
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 36, 24),
    new THREE.MeshStandardMaterial({ color: 0xf6f7f2, roughness: 0.52 }),
  );
  volleyball.add(ball);
  for (const color of [0x5ed8d0, 0xff8066]) {
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.73, 0.055, 10, 60),
      new THREE.MeshStandardMaterial({ color, roughness: 0.42 }),
    );
    stripe.rotation.x = color === 0x5ed8d0 ? 0.9 : -0.45;
    stripe.rotation.y = color === 0x5ed8d0 ? 0.3 : 1.1;
    volleyball.add(stripe);
  }
  volleyball.add(makeLabel("VolleyCore", projectMeta.volley.accent, -1.08));
  animated.push({ object: volleyball, kind: "rotate", offset: 0 });
  registerProject("volley", volleyball);

  const economy = new THREE.Group();
  economy.position.set(-2.65, 0.66, 3.25);
  const chestMaterial = new THREE.MeshStandardMaterial({
    color: 0x71512d,
    roughness: 0.72,
    metalness: 0.08,
  });
  const chestBase = box(1.8, 0.92, 1.25, chestMaterial);
  economy.add(chestBase);
  const lid = box(1.85, 0.45, 1.3, chestMaterial);
  lid.position.y = 0.7;
  lid.rotation.x = -0.08;
  economy.add(lid);
  const lock = box(
    0.34,
    0.48,
    0.12,
    new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.75, roughness: 0.25 }),
  );
  lock.position.set(0, 0.22, 0.69);
  economy.add(lock);
  for (let index = 0; index < 5; index += 1) {
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24),
      new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.24 }),
    );
    coin.rotation.x = Math.PI / 2;
    coin.position.set(-0.48 + index * 0.24, 1.05 + (index % 2) * 0.12, 0.08);
    economy.add(coin);
  }
  economy.add(makeLabel("Fallen Economy", projectMeta.economy.accent, -1.22));
  registerProject("economy", economy);

  const piano = createPiano();
  piano.position.set(0, 0.42, 4.25);
  piano.rotation.y = Math.PI;
  scene.add(piano);
  animated.push({ object: piano, kind: "piano", offset: 0 });

  const pointer = new THREE.Vector2(2, 2);
  const raycaster = new THREE.Raycaster();
  let hoveredId = null;
  let selectedId = "agent";
  let motionPaused = reducedMotion;
  const desiredCamera = overviewPosition.clone();
  const desiredTarget = overviewTarget.clone();
  const currentTarget = overviewTarget.clone();
  const mouseParallax = new THREE.Vector2();

  function setHighlight(id, force = false) {
    if (!force && hoveredId === id) return;
    hoveredId = id;
    for (const [projectId, group] of projects) {
      const active = projectId === id || projectId === selectedId;
      group.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if ("emissiveIntensity" in material) {
            material.userData.baseEmissive ??= material.emissiveIntensity;
            material.emissiveIntensity = active
              ? Math.max(1.35, material.userData.baseEmissive)
              : material.userData.baseEmissive;
          }
        }
      });
    }
    canvas.style.cursor = id ? "pointer" : "grab";
  }

  function selectProject(id, moveCamera = true) {
    const meta = projectMeta[id];
    const group = projects.get(id);
    if (!meta || !group) return;
    selectedId = id;
    document.querySelector("#scene-index").textContent = meta.index;
    document.querySelector("#scene-title").textContent = meta.title;
    document.querySelector("#scene-description").textContent = meta.description;
    const link = document.querySelector("#scene-link");
    link.href = meta.href;
    link.style.setProperty("--scene-accent", `#${meta.accent.toString(16).padStart(6, "0")}`);
    document
      .querySelector("#scene-inspector")
      .style.setProperty("--scene-accent", `#${meta.accent.toString(16).padStart(6, "0")}`);

    document.querySelectorAll("[data-scene-project]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.sceneProject === id));
    });

    if (moveCamera) {
      const worldPosition = new THREE.Vector3();
      group.getWorldPosition(worldPosition);
      desiredTarget.copy(worldPosition).add(new THREE.Vector3(0, 0.35, 0));
      desiredCamera.copy(worldPosition).add(meta.cameraOffset);
    }
    setHighlight(hoveredId, true);
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
    mouseParallax.set(pointer.x, pointer.y);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
    setHighlight(hit?.object.userData.projectId ?? null);
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.set(2, 2);
    mouseParallax.set(0, 0);
    setHighlight(null);
  });

  canvas.addEventListener("click", () => {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
    if (hit?.object.userData.projectId) {
      selectProject(hit.object.userData.projectId);
    }
  });

  let previousTime = performance.now();
  function render(time) {
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    const speed = reducedMotion ? 1 : 1 - Math.pow(0.001, delta);
    camera.position.lerp(desiredCamera, speed);
    currentTarget.lerp(desiredTarget, speed);

    if (!motionPaused) {
      const parallax = window.innerWidth < 760 ? 0.08 : 0.22;
      camera.position.x += (mouseParallax.x * parallax - camera.position.x * 0.0001) * 0.018;
      camera.position.y += mouseParallax.y * parallax * 0.012;
      for (const item of animated) {
        if (item.kind === "light") {
          item.object.intensity = 4.2 + Math.sin(time * 0.0018 + item.offset) * 1.1;
        } else if (item.kind === "rotate") {
          item.object.rotation.y += delta * 0.35;
          item.object.position.y = 0.78 + Math.sin(time * 0.0017) * 0.08;
        } else if (item.kind === "piano") {
          const keys = item.object.userData.keys;
          const active = Math.floor(time / 260) % keys.length;
          keys.forEach((key, index) => {
            key.position.y = index === active ? -0.04 : 0;
          });
        }
      }
    }

    for (const [id, group] of projects) {
      const targetScale = id === selectedId || id === hoveredId ? 1.035 : 1;
      group.scale.lerp(
        group.userData.baseScale.clone().multiplyScalar(targetScale),
        reducedMotion ? 1 : 0.12,
      );
    }

    camera.lookAt(currentTarget);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.fov = width < 760 ? 52 : 38;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  resize();
  selectProject("agent", false);
  requestAnimationFrame(render);
  document.body.classList.add("scene-ready");

  function box(width, height, depth, material) {
    return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  }

  function makeLabel(text, color, y) {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512;
    labelCanvas.height = 96;
    const context = labelCanvas.getContext("2d");
    context.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    context.fillStyle = "rgba(7, 10, 8, 0.88)";
    context.fillRect(4, 4, 504, 88);
    context.strokeStyle = `#${color.toString(16).padStart(6, "0")}`;
    context.lineWidth = 4;
    context.strokeRect(4, 4, 504, 88);
    context.fillStyle = "#f7faf6";
    context.font = "700 34px Segoe UI, Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 256, 50);
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 0.5),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
    );
    label.position.set(0, y, 0.18);
    return label;
  }

  function createPiano() {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x111412,
      roughness: 0.3,
      metalness: 0.48,
    });
    const body = box(3.3, 0.72, 1.15, bodyMaterial);
    body.position.y = 0.35;
    group.add(body);
    const back = box(3.3, 1.25, 0.22, bodyMaterial);
    back.position.set(0, 1.15, -0.45);
    group.add(back);
    const keys = [];
    for (let index = 0; index < 18; index += 1) {
      const whiteKey = box(
        0.16,
        0.11,
        0.72,
        new THREE.MeshStandardMaterial({ color: 0xf3f1e8, roughness: 0.45 }),
      );
      whiteKey.position.set(-1.45 + index * 0.171, 0.74, 0.18);
      group.add(whiteKey);
      keys.push(whiteKey);
      if (![2, 6, 9, 13, 16].includes(index)) {
        const blackKey = box(
          0.095,
          0.13,
          0.43,
          new THREE.MeshStandardMaterial({ color: 0x1a1e1b, roughness: 0.25 }),
        );
        blackKey.position.set(-1.365 + index * 0.171, 0.83, -0.02);
        group.add(blackKey);
      }
    }
    for (const x of [-1.32, 1.32]) {
      const leg = box(0.18, 0.85, 0.18, bodyMaterial);
      leg.position.set(x, -0.36, 0);
      group.add(leg);
    }
    group.userData.keys = keys;
    return group;
  }
}
