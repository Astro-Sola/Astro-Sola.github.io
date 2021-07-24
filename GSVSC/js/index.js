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
    await new Promise((resolve, reject) => setTimeout(resolve, 200));
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
    camera.position.set(-0, 0, -600);
    camera.setRotationFromAxisAngle(-1,0,0);

    // made camera controls
    const controls = new THREE.TrackballControls(camera, renderer.domElement);

    // smooth camera controls
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    // mouse and raycaster
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 2.0;
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
            if(jsonData){
            //
            const geometry = new THREE.BufferGeometry();
            const position = jsonData[i].position;
            geometry.setAttribute('position', new THREE.Float32BufferAttribute( position, 3 ));
            const material = new THREE.PointsMaterial({
                size:10,
                map : texturePicker(jsonData[i].type),
                transparent: true,
                alphaTest: 0.5,
                sizeAttenuation: true,
                color: parseInt( jsonData[i].color, 16)
            });
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
            //
            if(jsonData[i].connectMaj.length != 0){linesegment(jsonData, jsonData[i].id);}
        }
    }
    mobStar(10000, 1600, -400, 0, 0, 0x444444, 0);
    mobStar(1000, 200, -400, -75, 273, 0x556677, 1);
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
    //////
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
            pickedObject.material.color.set( 0xffffaa );
            starDataTextReplace(pickedObject);
        }
    }
    function starDataTextReplace(object){
        let id = object.name;
        let objectPos = object.geometry.getAttribute('position').array;
        //
        let stellarName = nameArray[id];
        let stellarNameText = document.getElementById('labels');
        //
        let stellarNation = nationArray[id];
        let stellarNationText = document.getElementById('nation');
        //
        stellarNameText.innerHTML = stellarName + "星系<br>ID：" + id + "<br>座標：( " + objectPos +")";
        console.log(objectPos);
        let stellarNationTextArray = [];
        for( i=0; i < stellarNation.length; i++ ){
            stellarNationTextArray.push( '<li>' + stellarNation[i] + '</li>' );
        }
        stellarNationText.innerHTML = stellarNationTextArray.join('');
    }
    //////
    // callbackArrNum
    function callbackArrNum(sourceData, calledId){
        let i;
        for( i=0; i < sourceData.length; i++ ){
            if(sourceData[i].id == calledId){
                break;
            }
        }
        return i;
    }
    // linesegment
    function linesegment(sourceData, id){
        const material = new THREE.LineBasicMaterial({
            color: 0x666666,
        });
        for(let i=0; i < sourceData[id].connectMaj.length; i++){
            let points = [];
            let startPointPos  = new THREE.Vector3(sourceData[id].position[0], sourceData[id].position[1], sourceData[id].position[2]);
            points.push(startPointPos);
            let endPointId = sourceData[id].connectMaj[i];
            endPointId = callbackArrNum(sourceData, endPointId);
            let endPointPos  = new THREE.Vector3(sourceData[endPointId].position[0], sourceData[endPointId].position[1], sourceData[endPointId].position[2]);
            points.push(endPointPos);
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.LineSegments(geometry, material);
            scene.add(line);
        }
    }
    //////
    // mobstar
    function mobStar(quantity, radius, offsetX, offsetY, offsetZ, color, type){
        const geometry = new THREE.BufferGeometry();
        const position = [];
        for(let i=0; i < quantity; i++){
            let r ;
            switch(type){
                case 0: r = Math.pow(radius, 3) * Math.random() ;break;
                case 1: let rp = Math.pow(Math.random(), 8);
                r = Math.pow(radius, 3) * rp ; break;
            }
            let z = (Math.random()-0.5)* 2;
            let phi = Math.random() * Math.PI * 2;
            let x = Math.cbrt(r) * Math.sqrt(1 - z * z) * Math.cos(phi) + offsetX;
            let y = Math.cbrt(r) * Math.sqrt(1 - z * z) * Math.sin(phi) + offsetY;
            z = Math.cbrt(r) * z + offsetZ;
            position.push(x, y, z);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute( position, 3 ));
        const material = new THREE.PointsMaterial({color: color});
        const points = new THREE.Points(geometry, material);
        scene.add(points);
    }
    
    //////
    function texturePicker(texutreNumber){
        let texture;
        const loader = new THREE.TextureLoader();
        switch(texutreNumber){
            case 0: texture = loader.load("img/starclass00.png"); break;
            case 1: texture = loader.load("img/starclass01.png"); break;
            case 2: texture = loader.load("img/starclass02.png"); break;
            case 3: texture = loader.load("img/starclass03.png"); break;
            case 4: texture = loader.load("img/starclass04.png"); break;
        }
        return texture;
    }
}