// ページの読み込みを待つ
window.addEventListener('load', init);

function init() {
    // set display size
    const width = 960;
    const height = 540;

    // made a renderer
    const canvas = document.querySelector('#mainCanvas');
    const renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setSize(width, height);

    // made a scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 2000, 3000);

    // made camera
    const camera = new THREE.PerspectiveCamera(45, width / height);

    // camera offsets
    camera.position.set(0, 0, 20);

    // made camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // smooth camera controls
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    // mouse and raycaster
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.2;


    // group
    const starDataArray = [];
    const starData = new StarData();
    const pointsArray = [];
    StarData.scene = scene;
    // create points
    starData.pointMakeInstance(scene, pointsArray, 0, 0, 0, 0x8888ff);
    starData.name = "lavelt";
    starDataArray.push( starData );
    starData.pointMakeInstance(scene, pointsArray, 4, 2, 5, 0x002288);
    starData.name = "Leeus";
    starDataArray.push( starData );
    // event
    canvas.addEventListener('mousemove', onMouseMove);
    // picked object parameter
    let pickedObject = undefined;
    let pickedObjectColor = 0;
    let intersects = [];
    console.log(starDataArray);

    /////
    onResize();
    tick();
    /////

    // per everyframes
    function tick() {
        // raycast
        raycaster.setFromCamera(mouse, camera);
        // intersects
        intersects = raycaster.intersectObjects(pointsArray);
        if(pickedObject != undefined){
            pickedObject.material.color.set( pickedObjectColor );
            pickedObject = undefined;
        }
        // if raycast stat not zero.
        if( intersects.length > 0 ){
            pickedObject = intersects[0].object;
            pickedObjectColor = pickedObject.material.color.getHex();
            pickedObject.material.color.set( 0xffff00 );
        }
        // update camera controls
        controls.update();
        // if resize
        window.addEventListener('resize', onResize, false);
        // rendering
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    /////
    // resize event
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    /////
    // make points instance
    /////
    // mousemove
    function onMouseMove(event){
        const element = event.currentTarget;
        // canvas XY
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        // canvas width height
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        // nomalization
        mouse.x = ( x / w ) * 2 - 1;
        mouse.y = -( y / h ) * 2 + 1;
    }
    
}

class StarData{
    constructor(scene, id, name ){
        this.scene = scene;
        this.points = new THREE.Points();
        this.id = id;
        this.name = name;
    }
    pointMakeInstance( scene, pointsArray, x, y, z ,color ) {
        const geometry = new THREE.BufferGeometry();
        const position = [ x, y, z ];
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
        const material = new THREE.PointsMaterial({ size: 1, color: color });
        const points = new THREE.Points( geometry, material );
        scene.add( points );
        pointsArray.push( points );
    }
}