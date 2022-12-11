import './style.css'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { Group, Scene, TextureLoader } from 'three';

// <canvas id="galaxy-map"></canvas> を表示先にする
const canvas = document.getElementById('galaxy-map');
const renderer = new THREE.WebGLRenderer({ canvas });

//sceneとcameraを定義
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//恒星に使用するデータを定義
const starDataEl = document.getElementById('star-data');
const starNameEl = document.getElementById('star-name');
const starPositionEl = document.getElementById('star-position');
const starNationsEl = document.getElementById('star-nations');
const starDiscriptionEl = document.getElementById('star-discription');
//一時的にデータを格納する場所
let clickedData = null;

// Set up controls
const controls = new TrackballControls(camera, canvas);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.4;

// ウィンドウがリサイズされた時に更新する
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  // 画面いっぱいに表示するために、カメラのアスペクト比を変更する
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  // レンダラーのサイズも変更する
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// 初期化時にも更新する
onWindowResize();

document.body.appendChild( renderer.domElement );

/*//skybox修正
// 1. skyboxの画像を用意する
const skyboxImages = [
  './img/skybox/1.png',
  './img/skybox/2.png',
  './img/skybox/3.png',
  './img/skybox/4.png',
  './img/skybox/5.png',
  './img/skybox/6.png'
];

// 2. CubeTextureLoaderを使用してskyboxの画像を読み込む
const textureLoader = new THREE.CubeTextureLoader();
const skyboxTexture = textureLoader.load(skyboxImages);

// 3. 変更したいskyboxをシーンの背景に設定する
scene.background = skyboxTexture;
*/



// Load star data from starData.json
const starData = require('./starData.json');

// Create stars using Three.js sprites
const stars = [];
starData.forEach((data) => {
  const texture = new TextureLoader().load('./img/star.png');
  const star = new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: data.color,
      map: texture
    })
  );
  star.position.set(data.position[0], data.position[1], data.position[2]);
  star.scale.set(data.size, data.size, data.size);
  star.name = data.name;
  star.nations = data.nations;
  star.discription = data.text;
  stars.push(star);

  // Create an array to keep track of lines that have already been drawn
  const drawnLines = [];

  // Add a line connecting this star to the stars in the "link" array
  data.link.forEach((linkedStarName) => {
  // Find the star that this star is linked to
  const linkedStar = stars.find((star) => star.name === linkedStarName);
  // If the linked star was found, add a line between the two stars
    if (linkedStar) {
      // Check if a line with the same positions has already been drawn
      const lineKey = star.position.toString() + linkedStar.position.toString();
      if (!drawnLines.includes(lineKey)) {
        // Add the line to the list of drawn lines
        drawnLines.push(lineKey);
        console.log(star.position, linkedStar.position);
        const lineMaterial = new THREE.LineBasicMaterial({color: 0x333333});
        let pointArray = [star.position, linkedStar.position];
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setFromPoints(pointArray);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    }
  });
  //add star scene
  scene.add(star);
});

//ターゲットスプライト
// スプライトに赤いリングを表示
const targetTexture = new TextureLoader().load('./img/target_ring.png');
const target = new THREE.Sprite(
  new THREE.SpriteMaterial({
    color: "#ff0000",
    map: targetTexture,
  })
);
target.name = "target";
target.visible = false;
scene.add(target);

// Set up event listener for clicks on stars
canvas.addEventListener('click', (event) => {
  // Set up raycaster
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(
    new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    ),
    camera
  );

  // Find intersected stars
  const intersects = raycaster.intersectObjects(stars);

  // スプライトのマウスオーバーか選択したときの処理
  if (intersects.length > 0) {
    // クリックされたスプライトのデータを取得
    clickedData = starData.find((d) => d.name === intersects[0].object.name);
    //ターゲットスプライトの位置を星に合わせる
    target.position.set(clickedData.position[0], clickedData.position[1], clickedData.position[2]);
    //ターゲットスプライトを表示する
    target.visible = true;
    

    // クリックされたスプライトのデータがある場合のみ表示する
    if (clickedData) {
      // クリックされたスプライトのデータを表示
      starDataEl.style.display = 'block';
      starNameEl.innerHTML = clickedData.name;
      starPositionEl.innerHTML = `Position: (${clickedData.position[0]}, ${clickedData.position[1]}, ${clickedData.position[2]})`;
      // nationsを箇条書きで出力する
      starNationsEl.innerHTML = clickedData.nations.map(function (n) {
        return "<li>" + n + "</li>";
      }).join("");
      starDiscriptionEl.innerHTML = `${clickedData.text}`;
    }
  } else {
    //データがない場合にターゲットスプライトを非表示にする
    target.visible = false;
    starDataEl.style.display = 'none';
  }
  console.log(target);
});


camera.position.z = 2.5;

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
    target.material.rotation +=0.01;
};
animate();
