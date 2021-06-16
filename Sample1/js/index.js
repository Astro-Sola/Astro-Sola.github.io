// ページの読み込みを待つ
window.addEventListener('load', init);

function init() {
    // set display size
    const width = 960;
    const height = 540;
    // label select
    const labelContainerElements = document.querySelector('#labels');
    const tempV = new THREE.Vector3();
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
    camera.position.set(0, 0, 100);

    // made camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // smooth camera controls
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    // glids
    const plane = new THREE.GridHelper(300, 10, 0x6688aa, 0x224466);
    scene.add(plane);

    /////

    function makeInstance(x,y,z, name, color){
        const spriteMaterial = new THREE.SpriteMaterial({color: color});

        const element = document.createElement('div');
        element.textContent = name;
        labelContainerElements.appendChild(element);
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z);
        scene.add(sprite);
        
        return {sprite, element};
    }

    /////
    const billboards = [
        makeInstance(0, 0, 0, 'Lavelt', 0xffffff)
    ];
    /////

    onResize();
    tick();

    /////

    // per everyframes
    function tick() {
        // update camera controls
        controls.update();
   
        // if resize
        window.addEventListener('resize', onResize, false);

        // labels
        billboards.forEach((spriteInfo) => {
            const {sprite, element} = spriteInfo;
            sprite.updateWorldMatrix(true, false);
            sprite.getWorldPosition(tempV);
            tempV.project(camera);
            const x = (tempV.x * .5 +.5) * canvas.clientWidth;
            const y = (tempV.y * .5 +.5) * canvas.clientHeight;
            element.style.transform = `transrate(-50%, -50%) transrate(${x}px,${y}px)`;
            console.log(element.style.transform);
        });

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
}