import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// 各定数の定義
let starData, scene, camera, renderer, controls, stars = [], constellationLines = [], starLabels = [];
let mode = 'spherical';
let fovMin = 10; // 視野角の最小値
let fovMax = 75; // 視野角の最大値
let showConstellations = true;
let showStarNames = true;
let showGrid = false;
let gridHelper, solarSystem;
const spectrumColors = {
'O': 0x9bb0ff,
'B': 0xaabfff,
'A': 0xcad7ff,
'F': 0xf8f7ff,
'G': 0xfff4ea,
'K': 0xffddb4,
'M': 0xffbd6f
};

// json 読み込み
fetch('stars.json')
.then(response => response.json())
.then(data => {
    starData = data;
    init();
});

// Create the CSS2DRenderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

// Create the text label function
function createTextLabel(text) {
    const div = document.createElement('div');
    div.className = 'text-label';
    div.textContent = text;
    div.style.position = 'absolute';
    div.style.transform = 'translate(-50%, -150%)'; // ラベルを星の真上に配置するために調整

    const label = new CSS2DObject(div);
    return label;
}

/// 星の詳細データ表示位置修正
const starDetails = document.getElementById('star-details');
starDetails.style.position = 'absolute';
starDetails.style.top = '10%'; // 位置の例
starDetails.style.right = '2%'; // 位置の例

// init 関数修正
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // まずコントロールを初期化する
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableRotate = true; // 回転を有効にする
    controls.enableZoom = true; // ズームを有効にする
    controls.enablePan = mode !== 'spherical'; // パンを無効化
    controls.target.set(0, 0, 0); // カメラのターゲットを原点に設定
    controls.update();

    // 各星について
    starData.forEach(star => {
        const pointGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([star.x, star.y, star.z]);
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const pointMaterial = new THREE.PointsMaterial({
            color: star.color,
            size: mode === 'spherical' ? star.size * 0.1 : star.size
        });

        const starPoint = new THREE.Points(pointGeometry, pointMaterial);
        starPoint.userData = star;
        scene.add(starPoint);
        stars.push(starPoint);

        const label = createTextLabel(star.name);
        label.position.set(star.x, star.y, star.z);
        starPoint.add(label);
        starLabels.push(label);
    });

    createConstellations();
    createGrid();
    createSolarSystem();

    // モードを設定する
    setMode(mode);

    camera.position.z = 10;

    document.addEventListener('click', onStarClick, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false); // ホイールイベントリスナーを追加
    animate();
}

// モード切替関数修正
function setMode(newMode) {
    mode = newMode;

    stars.forEach(starPoint => {
        const star = starPoint.userData;
        starPoint.position.set(star.x, star.y, star.z);

        // 天球モードでは星のサイズを小さくする
        const material = starPoint.material;
        if (mode === 'spherical') {
            material.size = star.size * 0.1; // サイズを0.1倍にする
        } else {
            material.size = star.size; // 通常のサイズに戻す
        }
    });

    starLabels.forEach(starLabel => {
        const labelElement = starLabel.element;
        if (mode === 'spherical') {
            starLabel.scale.set(0.1, 0.1, 0.1); // ラベルのサイズを0.1倍にする
            labelElement.style.transform = 'translate(-50%, -150%)'; // ラベルを星の真上に配置するよう調整
        } else {
            starLabel.scale.set(1, 1, 1); // 通常のサイズに戻す
            labelElement.style.transform = 'translate(-50%, -100%)'; // ラベルの位置を元に戻す
        }
    });

    if (controls) {
        controls.enablePan = mode !== 'spherical';
        controls.enableRotate = true; // 回転を有効にする
        controls.enableZoom = mode !== 'spherical'; // ズームを無効にする（視野角でズーム）
        if (mode === 'spherical') {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }

    // 太陽系の表示を切り替える
    solarSystem.visible = mode !== 'spherical';
}

// ホイールイベントリスナー修正
function onDocumentMouseWheel(event) {
    if (mode === 'spherical') {
        camera.fov += event.deltaY * 0.05;
        camera.fov = THREE.MathUtils.clamp(camera.fov, fovMin, fovMax);
        camera.updateProjectionMatrix();
    }
}

// 星座線関数
function createConstellations() {
constellationLines.forEach(line => scene.remove(line));
constellationLines = [];

starData.forEach(star => {
    if (star.constellationLines) {
    star.constellationLines.forEach(targetId => {
        const targetStar = starData.find(s => s.id === targetId);
        if (targetStar) {
        const material = new THREE.LineBasicMaterial({ color: 0x888888 });
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);

        positions[0] = star.x;
        positions[1] = star.y;
        positions[2] = star.z;

        positions[3] = targetStar.x;
        positions[4] = targetStar.y;
        positions[5] = targetStar.z;

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const line = new THREE.Line(geometry, material);
        constellationLines.push(line);
        scene.add(line);
        }
    });
    }
});
}


// 星座線スイッチ関数
function toggleConstellations() {
showConstellations = !showConstellations;
constellationLines.forEach(line => line.visible = showConstellations);
}
// ネームタグスイッチ関数
function toggleStarNames() {
showStarNames = !showStarNames;
starLabels.forEach(label => label.visible = showStarNames);
}
// 座標線スイッチ関数
function toggleGrid() {
showGrid = !showGrid;
gridHelper.visible = showGrid;
}
// 座標線作成関数
function createGrid() {
gridHelper = new THREE.GridHelper(50, 50);
gridHelper.visible = false;
scene.add(gridHelper);
}
// 太陽系生成関数
function createSolarSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffff00, size: 1.5 });
    solarSystem = new THREE.Points(geometry, material);
    solarSystem.position.set(0, 0, 0);
    solarSystem.visible = false;
    scene.add(solarSystem);
}

// 天体をクリックしたとき
function onStarClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(stars);
    if (intersects.length > 0) {
        const star = intersects[0].object.userData;
        document.getElementById('info').innerHTML = `
            <strong>${star.name}</strong><br>
            座標: (${star.x}, ${star.y}, ${star.z})<br>
            等級: ${star.magnitude}<br>
            大きさ: ${star.size}<br>
            質量: ${star.mass}<br>
            温度: ${star.temperature}<br>
            光度: ${star.luminosity}<br>
            スペクトル: ${star.spectrum}<br>
            属する星座: ${star.constellation}
        `;
    }
}


function animate() {
    requestAnimationFrame(animate);
    if (mode === 'spherical') {
        controls.update();
    }
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

window.setMode = setMode;
window.toggleConstellations = toggleConstellations;
window.toggleStarNames = toggleStarNames;
window.toggleGrid = toggleGrid;