import './style.css'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

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
controls.panSpeed = 0.8;

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

// Load star data from starData.json
const starData = require('./starData.json');

// Create stars using Three.js sprites
const stars = [];
starData.forEach((data) => {
  const star = new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: data.color,
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
        const lineMaterial = new THREE.LineBasicMaterial({color: 0xcccccc});
        let pointArray = [star.position, linkedStar.position];
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setFromPoints(pointArray);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    }
  });
});

// Add stars to scene
stars.forEach((star) => {
  scene.add(star);
});

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

  // Only update clickedData if there are intersects and it is not already set
  if (intersects.length > 0 && !clickedData) {
    // Store clicked star data
    clickedData = starData.find((d) => d.name === intersects[0].object.name);
  }

  // Reset clickedData if there are no intersects
  if (intersects.length === 0) {
    clickedData = null;
  }

  if (clickedData) {
    // Show data for clicked star
    starDataEl.style.display = 'block';
    starNameEl.innerHTML = clickedData.name;
    starPositionEl.innerHTML = `Position: (${clickedData.position[0]}, ${clickedData.position[1]}, ${clickedData.position[2]})`;
    // nationsを箇条書きで出力する
    starNationsEl.innerHTML = clickedData.nations.map(function (n) {
      return "<li>" + n + "</li>";
    }).join("");
    starDiscriptionEl.innerHTML = `${clickedData.text}`;
  } else {
    starDataEl.style.display = 'none';
  }

});


camera.position.z = 2.5;

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
};
animate();
