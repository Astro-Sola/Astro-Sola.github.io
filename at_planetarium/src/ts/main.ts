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
    scene = new THREE.Scene();
        
    // カメラの設定
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1.0e8
    );
    
    // レンダラーの設定
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true
    });
    
    // レンダラーの初期設定
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    renderer.sortObjects = true;
    
    // キャンバスのスタイル設定
    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.body.appendChild(canvas);

    // アルファ値の処理を改善
    renderer.setClearColor(0x000000, 1);
    renderer.sortObjects = true;      // オブジェクトのソートを有効化
    document.body.appendChild(renderer.domElement);
    raycaster = new THREE.Raycaster();
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
    window.addEventListener('resize', onWindowResize, false);
    } catch (error) {
        console.error('Initialization error:', error);
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

  // setupUI 関数内のタグ表示制御を修正
  const tagControl = createControlGroup('Tag Display');
    uiContainer.appendChild(tagControl);

    const tagCheckbox = createCheckbox('Show Tags', true);
    tagControl.appendChild(tagCheckbox);

    tagCheckbox.querySelector('input')?.addEventListener('change', (e) => {
        const isVisible = (e.target as HTMLInputElement).checked;
        console.log('Changing tag visibility to:', isVisible);
        apollaSystem.getCelestialBodies().forEach(body => {
            body.setTagVisibility(isVisible);
        });
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
  label.style.cursor = 'pointer';  // カーソルスタイルを追加
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = checked;
  checkbox.style.marginRight = '8px';  // チェックボックスとテキストの間隔を追加
  
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
      apollaSystem.update(delta, camera);
      checkIntersections();
      renderer.render(scene, camera);
  } catch (error) {
      console.error('Animation error:', error);
      isAnimating = false;
  }
}

function checkIntersections(): void {
  raycaster.setFromCamera(mouse, camera);

  const celestialBodies = apollaSystem.getCelestialBodies();
  const intersectObjects: THREE.Object3D[] = [];
  
  // タグのヒットエリアを調整
  celestialBodies.forEach(body => {
      const tagMesh = body.getTagMesh();
      // タグのヒットエリアを実際の表示位置に合わせて調整
      if (tagMesh.geometry) {
          tagMesh.geometry.computeBoundingSphere();
          if (tagMesh.geometry.boundingSphere) {
              tagMesh.geometry.boundingSphere.center.copy(tagMesh.position);
          }
      }
      intersectObjects.push(tagMesh);
  });

  const intersects = raycaster.intersectObjects(intersectObjects, true);

  // カーソルスタイルの更新
  if (intersects.length > 0) {
      renderer.domElement.style.cursor = 'pointer';
  } else {
      renderer.domElement.style.cursor = 'default';
  }

  let intersectedBody: CelestialBody | null = null;

  if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      intersectedBody = celestialBodies.find(body => 
          body.getTagMesh() === hitObject
      ) || null;
  }

  if (intersectedBody === hoveredBody) return;

  if (hoveredBody) {
      hoveredBody.setHighlight(false);
  }
  if (intersectedBody) {
      intersectedBody.setHighlight(true);
  }
  
  hoveredBody = intersectedBody;
  needsRender = true;
}

// イージング関数
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
  const tagMeshes = celestialBodies.map(body => body.getTagMesh());
  
  const intersects = raycaster.intersectObjects(tagMeshes, true);

  if (intersects.length > 0) {
    const clickedTag = intersects[0].object;
    const clickedBody = celestialBodies.find(body => body.getTagMesh() === clickedTag);
    
    if (clickedBody) {
      displayCelestialBodyInfo(clickedBody);
      
      // カメラをクリックした天体に向ける
      const targetPosition = clickedBody.getMesh().position.clone();
      const distance = camera.position.distanceTo(targetPosition);
      const newPosition = camera.position.clone()
        .sub(controls.target)
        .normalize()
        .multiplyScalar(distance)
        .add(targetPosition);
      
      // カメラの移動をアニメーション化
      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      const duration = 1000; // ミリ秒
      const startTime = Date.now();
      
      function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数を使用してスムーズな動きを実現
        const eased = easeInOutCubic(progress);
        
        camera.position.lerpVectors(startPosition, newPosition, eased);
        controls.target.lerpVectors(startTarget, targetPosition, eased);
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      }
      
      animateCamera();
    }
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
  // 現在のビューポートのサイズを取得
  const width = window.innerWidth;
  const height = window.innerHeight;

  // カメラのアスペクト比を更新
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // レンダラーのサイズを更新
  renderer.setSize(width, height, true);
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