import * as THREE from 'three';
import { TrackballControls } from '/node_modules/three/examples/jsm/controls/TrackballControls.js';
import { TextureLoader } from 'three';
import * as UTILITY from './utils/utility.js';
import * as Object from './objects/objects.js';

// Display <canvas id="galaxy-map"></canvas>
const canvas = document.getElementById('galaxy-map');
const renderer = new THREE.WebGLRenderer({ canvas });

//Define scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Set up controls
const controls = new TrackballControls(camera, canvas);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.4;

//Update when window is resized
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  //Change the camera aspect ratio to fill the screen
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  //Also resize the renderer
  renderer.setSize( window.innerWidth, window.innerHeight );
}

//Also update on initialization
onWindowResize();
document.body.appendChild( renderer.domElement );

//StarSystem class initialization
class StarSystem {
  constructor(data) {
    this.name = data.name;
    this.class = data.class;
    this.stars = data.stars;
    this.position = data.position;
    this.size = data.size;
    this.color = data.color;
    this.link = data.link;
    this.nations = data.nations;
    this.text = data.text;
  }
}

async function createStarsys(starDatas){
}

async function createGalaxyObjects() {
  const starData = await UTILITY.loadJSONFile('../data/stars.json');
  console.log(starData);
  createStarsys(starData);
}

createGalaxyObjects();



camera.position.z = 2.5;

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
};
animate();