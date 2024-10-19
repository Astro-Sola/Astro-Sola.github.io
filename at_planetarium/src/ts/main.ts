import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ApollaBinarySystem } from './ApollaBinarySystem';
import { CelestialBody } from './CelestialBody';
import '../styles/style.css';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let apollaSystem: ApollaBinarySystem;
let controls: OrbitControls;
let infoPanel: HTMLDivElement;
let closeButton: HTMLButtonElement;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let hoveredBody: CelestialBody | null = null;
let needsRender: boolean = false;
let clock: THREE.Clock;
let isAnimating = true;

async function init(): Promise<void> {
  try{
    // Set up scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1.0e12);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.1;
    raycaster.params.Points.threshold = 0.1;
    raycaster.params.Mesh.threshold = 0.1;
    mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    clock = new THREE.Clock();

    // Set up camera and controls
    camera.position.z = 100;
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create Apolla Binary System
    apollaSystem = new ApollaBinarySystem(scene);

    // Update lighting
    setupLighting();

    // Set up UI
    setupUI();
    
    console.log('Initialization complete');
    
    await loadResources();
    // Start animation
    animate();
    window.addEventListener('beforeunload',cleanup);
  } catch (error){
    console.error('Initialization error:',error);
  }
}

async function loadResources(): Promise<void> {
  return new Promise((resolve) => {
    // ここで必要なリソースを非同期で読み込む
    // 例: テクスチャ、3Dモデル、JSONデータなど
    
    // 仮の遅延を追加（実際の読み込み処理に置き換えてください）
    setTimeout(() => {
      console.log('Resources loaded');
      resolve();
    }, 1000);
  });
}

function setupLighting(): void {
  // Remove existing lights if any
  scene.remove(...scene.children.filter(child => child instanceof THREE.Light));

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // Add point light (sun)
  const sunLight = new THREE.PointLight(0xffffff, 1, 100000);
  scene.add(sunLight);

  console.log('Lighting setup complete');
}

function setupUI(): void {
  const uiContainer = document.createElement('div');
  uiContainer.style.position = 'absolute';
  uiContainer.style.top = '10px';
  uiContainer.style.left = '10px';
  uiContainer.style.padding = '10px';
  uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  uiContainer.style.color = 'white';
  uiContainer.style.fontFamily = 'Arial, sans-serif';
  uiContainer.style.fontSize = '14px';
  uiContainer.style.borderRadius = '5px';
  document.body.appendChild(uiContainer);

  // Time Control
  const timeControl = createControlGroup('Time Control');
  uiContainer.appendChild(timeControl);

  const timeScaleSlider = createSlider(0.0, 2000, 1.0, 1);
  const timeScaleLabel = document.createElement('div');
  timeScaleLabel.textContent = 'Time Scale: 1.0 days/sec';
  timeControl.appendChild(timeScaleLabel);
  timeControl.appendChild(timeScaleSlider);

  timeScaleSlider.addEventListener('input', (e) => {
    const scale = parseFloat((e.target as HTMLInputElement).value);
    apollaSystem.setTimeScale(scale);
    timeScaleLabel.textContent = `Time Scale: ${scale.toFixed(1)} days/sec`;
  });

  
  // 軌道表示制御
  const orbitControlContainer = createControlGroup('Orbit Display');
  uiContainer.appendChild(orbitControlContainer);

  const orbitCheckbox = createCheckbox('Show Orbits', true);
  orbitControlContainer.appendChild(orbitCheckbox);

  orbitCheckbox.addEventListener('change', (e) => {
    apollaSystem.setOrbitVisibility((e.target as HTMLInputElement).checked);
  });

  // トレイル制御
  const trailControlContainer = createControlGroup('Trail Control');
  uiContainer.appendChild(trailControlContainer);

  const trailCheckbox = createCheckbox('Show Trails', true);
  trailControlContainer.appendChild(trailCheckbox);

  trailCheckbox.addEventListener('change', (e) => {
    apollaSystem.setTrailVisibility((e.target as HTMLInputElement).checked);
  });

  const trailLengthSlider = createSlider('10', '10000', '1', '1000');
  const trailLengthLabel = createLabel('Trail Length: 1000');
  trailControlContainer.appendChild(trailLengthLabel);
  trailControlContainer.appendChild(trailLengthSlider);

  trailLengthSlider.addEventListener('input', (e) => {
    const length = parseInt((e.target as HTMLInputElement).value);
    apollaSystem.setTrailLength(length);
    trailLengthLabel.textContent = `Trail Length: ${length}`;
  });

  const tagControl = createControlGroup('Tag Display');
  uiContainer.appendChild(tagControl);

  const tagCheckbox = createCheckbox('Show Tags', true);
  tagControl.appendChild(tagCheckbox);

  tagCheckbox.addEventListener('change', (e) => {
    apollaSystem.getCelestialBodies().forEach(body => 
      body.setTagVisibility((e.target as HTMLInputElement).checked)
    );
  });

  // 情報パネル
  infoPanel = document.createElement('div');
  infoPanel.style.position = 'fixed';
  infoPanel.style.top = '50%';
  infoPanel.style.left = '50%';
  infoPanel.style.transform = 'translate(-50%, -50%) scale(0.9)';
  infoPanel.style.backgroundColor = 'rgba(10, 20, 30, 0.9)';
  infoPanel.style.color = 'white';
  infoPanel.style.padding = '30px';
  infoPanel.style.borderRadius = '15px';
  infoPanel.style.maxWidth = '500px';
  infoPanel.style.width = '90%';
  infoPanel.style.maxHeight = '80%';
  infoPanel.style.overflow = 'auto';
  infoPanel.style.boxShadow = '0 0 30px rgba(0, 100, 200, 0.3)';
  infoPanel.style.display = 'none';
  infoPanel.style.transition = 'all 0.3s ease-in-out';
  infoPanel.style.fontFamily = 'Arial, sans-serif';
  document.body.appendChild(infoPanel);

  // 閉じるボタン
  closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.transition = 'all 0.2s ease-in-out';
  closeButton.onmouseover = () => { closeButton.style.transform = 'scale(1.1)'; };
  closeButton.onmouseout = () => { closeButton.style.transform = 'scale(1)'; };
  closeButton.onclick = () => {
    infoPanel.style.transform = 'translate(-50%, -50%) scale(0.9)';
    infoPanel.style.opacity = '0';
    setTimeout(() => { infoPanel.style.display = 'none'; }, 300);
  };
  infoPanel.appendChild(closeButton);

  renderer.domElement.addEventListener('click', onCelestialBodyClick);
}

function createControlGroup(title: string): HTMLDivElement {
  const container = document.createElement('div');
  container.style.marginBottom = '10px';
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  titleElement.style.color = 'white';
  titleElement.style.marginBottom = '5px';
  container.appendChild(titleElement);
  return container;
}

function createSlider(min: string, max: string, step: string, value: string): HTMLInputElement {
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = value;
  slider.style.width = '100%';
  return slider;
}

function createLabel(text: string): HTMLLabelElement {
  const label = document.createElement('label');
  label.textContent = text;
  label.style.color = 'white';
  return label;
}

function createCheckbox(labelText: string, checked: boolean): HTMLLabelElement {
  const label = document.createElement('label');
  label.style.color = 'white';
  label.style.display = 'flex';
  label.style.alignItems = 'center';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = checked;
  
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(labelText));
  
  return label;
}

function animate(): void {
  if (!isAnimating) return;
  
  requestAnimationFrame(animate);
  
  try {
    const delta = clock.getDelta();
    controls.update();

    adjustRaycasterPrecision(camera);  // 新しく追加
    
    apollaSystem.update(delta, camera);
  
  // デバッグ情報の出力
  apollaSystem.getCelestialBodies().forEach(body => {
    console.log(`${body.getName()} position:`, body.getMesh().position);
    console.log(`${body.getName()} click mesh scale:`, body.getClickMesh().scale);
  });

    checkIntersections();
    
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Animation error:', error);
    isAnimating = false;
  }
}

function adjustRaycasterPrecision(camera: THREE.PerspectiveCamera): void {
  const minDistance = camera.near;
  const maxDistance = camera.far;
  const currentDistance = camera.position.length();  // カメラの原点からの距離

  // 距離を0から1の範囲に正規化
  const normalizedDistance = (currentDistance - minDistance) / (maxDistance - minDistance);

  // 指数関数を使用して精度を計算
  // ここでは、近い距離で高精度（小さい値）、遠い距離で低精度（大きい値）となるようにします
  const minPrecision = 1e-10;  // より小さい値に設定
  const maxPrecision = 1e-4;   // 最大精度も調整
  const exponent = 2;          // より緩やかな曲線に

  const precision = minPrecision + (maxPrecision - minPrecision) * Math.pow(normalizedDistance, exponent);

  // レイキャスターの各パラメータに精度を設定
  raycaster.params.Line.threshold = precision;
  raycaster.params.Points.threshold = precision;
  raycaster.params.Mesh.threshold = precision;

  console.log(`Camera distance: ${currentDistance.toFixed(2)}, Adjusted raycaster precision: ${precision.toExponential(2)}`);
}

function checkIntersections(): void {
  raycaster.setFromCamera(mouse, camera);

  const celestialBodies = apollaSystem.getCelestialBodies();
  const tagMeshes = celestialBodies.map(body => body.getTagMesh());

  const intersects = raycaster.intersectObjects(tagMeshes, true);

  let intersectedBody: CelestialBody | null = null;

  if (intersects.length > 0) {
    const clickedTag = intersects[0].object;
    intersectedBody = celestialBodies.find(body => body.getTagMesh() === clickedTag) || null;
  }

  if (intersectedBody !== hoveredBody) {
    if (hoveredBody) {
      hoveredBody.setHighlight(false);
    }
    if (intersectedBody) {
      intersectedBody.setHighlight(true);
    }
    hoveredBody = intersectedBody;
  }
}

function onMouseMove(event: MouseEvent): void {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  checkIntersections();
}

function onCelestialBodyClick(event: MouseEvent): void {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const celestialBodies = apollaSystem.getCelestialBodies();
  const intersects = raycaster.intersectObjects(celestialBodies.map(body => body.getClickMesh()));

  if (intersects.length > 0) {
    const clickedBody = celestialBodies.find(body => body.getClickMesh() === intersects[0].object);
    if (clickedBody) {
      displayCelestialBodyInfo(clickedBody);
    }
  } else {
    infoPanel.style.display = 'none';
  }
}

function displayCelestialBodyInfo(body: CelestialBody): void {
  const info = body.getInfo();
  const name = body.getName();
  const color = body.getColor();
  const type = body.getType();
  const radius = body.getRadius();
  const mass = body.getMass();
  const temperature = body.getAverageTemperature();

  let content = `
    <h2 style="margin-top: 0; color: #3498db; font-size: 28px;">${name}</h2>
    <div style="display: flex; align-items: start; margin-bottom: 20px;">
      <div style="width: 150px; height: 150px; background-color: ${color}; border-radius: 50%; margin-right: 30px; box-shadow: 0 0 20px ${color};">
        <img src="/api/placeholder/150/150" alt="${name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
      </div>
      <div>
        <p style="font-size: 18px; margin-bottom: 10px;"><strong>Type:</strong> ${type}</p>
        <p style="font-size: 18px; margin-bottom: 10px;"><strong>Radius:</strong> ${radius.toLocaleString()} km</p>
        <p style="font-size: 18px; margin-bottom: 10px;"><strong>Mass:</strong> ${mass.toExponential(2)} kg</p>
        ${temperature !== undefined ? `<p style="font-size: 18px; margin-bottom: 10px;"><strong>Avg. Temperature:</strong> ${temperature}°C</p>` : ''}
      </div>
    </div>
    <div style="background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px;">
      <h3 style="color: #2ecc71; margin-top: 0;">Additional Information</h3>
      <p style="font-size: 16px; line-height: 1.5;">${info}</p>
    </div>
  `;

  infoPanel.innerHTML = content;
  infoPanel.appendChild(closeButton);

  infoPanel.style.display = 'block';
  setTimeout(() => {
    infoPanel.style.transform = 'translate(-50%, -50%) scale(1)';
    infoPanel.style.opacity = '1';
  }, 10);
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function cleanup(): void {
  isAnimating = false;
  
  // Three.js のリソースを解放
  renderer.dispose();
  apollaSystem.dispose(); 
  
  // イベントリスナーを削除
  window.removeEventListener('beforeunload', cleanup);
  renderer.domElement.removeEventListener('mousemove', onMouseMove);
}

window.addEventListener('resize', onWindowResize, false);

init().catch(error => console.error('Application error:', error));