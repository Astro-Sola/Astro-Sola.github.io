import * as THREE from 'three';
import { TrackballControls } from '/node_modules/three/examples/jsm/controls/TrackballControls.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as UTILITY from './utils/utility.js';
import * as MYOBJECT from './objects/objects.js';

const THRESHOLD = 0.001;

const canvas = document.getElementById('galaxy-map');
const renderer = new THREE.WebGLRenderer({ canvas });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const controls = new TrackballControls(camera, canvas);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.4;
camera.position.z = 5;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onWindowResize();
document.body.appendChild(renderer.domElement);

async function createGalaxyObjects() {
  const starDatas = await UTILITY.loadJSONFile('../data/stars.json');
  const pointsList = [];
  starDatas.forEach(starData => {
    const starPoint = MYOBJECT.createStarsys(starData);
    MYOBJECT.deleteClosePoint(scene, pointsList, starPoint, THRESHOLD);
  });
}

function addClickEvent() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const starDataDiv = document.getElementById('star-datas');
  function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    while (starDataDiv.firstChild) {
      starDataDiv.removeChild(starDataDiv.firstChild);
    }
    if (intersects.length > 0) {
      for (let i = 0; i < intersects.length; i++) {
        const point = intersects[i].object;
        const star = point.userData.star;
        const starDiv = document.createElement('div');
        starDiv.classList.add('star-data');
        starDiv.innerHTML = `
          <h2 id="star-name">${star.name}</h2>
          <h3 id="star-name-en">${star.name_en}</h3>
          <p id="star-position">Position: (${star.position.x}, ${star.position.y}, ${star.position.z})</p>
          <p id="star-size">Size: ${star.size}</p>
          <p id="star-nation">Nations: ${star.nations}</p>
          <p id="star-description">Description: ${star.description}</p>
          <button id="star-system-transition">Go to star system</button>
        `;
        starDataDiv.appendChild(starDiv);
        const starSystemButton = starDiv.querySelector('#star-system-transition');
        starSystemButton.addEventListener('click', async () => {
          await displayStarSystem(star);
        });
      }
    }
  }
  document.addEventListener('click', onMouseClick, false);
}

createGalaxyObjects();
addClickEvent();

function cameraDist(camera) {
  const cameraPosition = camera.position;
  const cameraTargetPosition = controls.target;
  const dist = new THREE.Vector3();
  dist.subVectors(cameraPosition, cameraTargetPosition);
  return dist.length();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  scene.traverse(function (element) {
    if (element.isPoints) {
      const scaleFactor = element.userData.star.size * Math.log(cameraDist(camera));
      element.material.size = scaleFactor;
    }
  });
}

animate();

