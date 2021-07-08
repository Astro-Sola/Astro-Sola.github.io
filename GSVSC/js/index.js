//処理の実行順の指定
async function progress(){
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "json/data_list.json", true);
    xmlHttp.send(null);
    xmlHttp.onload = function(){
        let data = xmlHttp.responseText;
        let jsonedData = JSON.parse(data || "null");
        return jsonedData;
    }
    await new Promise((resolve, reject) => setTimeout(resolve, 50));
    let jsonData = xmlHttp.onload();
    init(jsonData);
}

// ページの読み込みを待つ
window.addEventListener('load', progress);

function init(jsonData) {
    
    // set display size
    const width = 960;
    const height = 540;

    // made a renderer
    const canvas = document.querySelector('#mainCanvas');
    const renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setSize(width, height);

    // made a scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 3000, 4500);

    // made camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);

    // camera offsets
    camera.position.set(0, 600, 600);
    camera.setRotationFromAxisAngle(-1,0,0);

    // made camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // smooth camera controls
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    // mouse and raycaster
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    //raycaster.params.Points.threshold = 0.2;
    // picked object
    let pickedObject = undefined;
    let pickedObjectColor = 0;
    let intersects = [];
    // helper
    const axesHelper = new THREE.AxesHelper( 2000 );
    scene.add( axesHelper );



    // make instance
    const starDataArray = [];
    const pointsArray = [];
    const nameArray = [];
    const nationArray = [];
    for(let i = 0; i < jsonData.length; i++ ){
        starDataArray[i] = jsonData[i];
        //
        const geometry = new THREE.BufferGeometry();
        const position = jsonData[i].position;
        geometry.setAttribute('position', new THREE.Float32BufferAttribute( position, 3 ));
        const material = new THREE.PointsMaterial({ size:10, color: parseInt( jsonData[i].color, 16 )});
        const point = new THREE.Points( geometry, material );
        point.name = jsonData[i].id;
        scene.add(point);
        pointsArray.push(point);
        //
        const stellarName = jsonData[i].name;
        nameArray.push(stellarName);
        //
        const nationName = jsonData[i].nation;
        nationArray.push(nationName);
    }
    canvas.addEventListener('mousemove', onMouseMove);    

    /////
    onResize();
    tick();
    /////

    // per everyframes
    function tick() {
        // raycaster & intersects
        raycaster.setFromCamera( mouse, camera );
        intersects = raycaster.intersectObjects(pointsArray);
        // if clicked
        canvas.addEventListener('click', onMouseClick);
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
    // mouse moved
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
        // object status
    }
    // mouse clicked
    function onMouseClick(event){
        if( pickedObject != undefined ){
            if( intersects.length > 0 ){
                pickedObject.material.color.set( pickedObjectColor );
                starDataTextReplace(pickedObject);
                pickedObject = undefined;
            }
        }
        if( intersects.length > 0 ){
            pickedObject = intersects[0].object;
            pickedObjectColor = pickedObject.material.color.getHex();
            pickedObject.material.color.set( 0xffff00 );
            starDataTextReplace(pickedObject);
        }
    }
    function starDataTextReplace(object){
        let id = object.name;
        //
        let stellarName = nameArray[id];
        let stellarNameText = document.getElementById('labels');
        //
        let stellarNation = nationArray[id];
        let stellarNationText = document.getElementById('nation');
        //
        stellarNameText.innerText = stellarName + "星系";
        let stellarNationTextArray = [];
        for( i=0; i < stellarNation.length; i++ ){
            stellarNationTextArray.push( '<li>' + stellarNation[i] + '</li>' );
        }
        stellarNationText.innerHTML = stellarNationTextArray.join('');
    }
}