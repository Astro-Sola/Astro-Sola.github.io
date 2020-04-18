window.addEventListener("DOMContentLoaded", init);

function init() {
	//wait load
	window.addEventListener('load', init);
	// make renderer
	const renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector("#myCanvas"),
		antialias: true
	});

	// make scene
	const scene = new THREE.Scene();

	// make camera
	const camera = new THREE.PerspectiveCamera(
		45,
		width / height,
		1,
		10000
	);
	camera.position.set(0, 0, +1000);

	// make a box
	const geometry = new THREE.BoxGeometry(500, 500, 500);
	const material = new THREE.MeshStandardMaterial({
		color: 0x0000ff
	});
	const box = new THREE.Mesh(geometry, material);
	scene.add(box);

	// make directionaly light
	const light = new THREE.DirectionalLight(0xffffff);
	light.intensity = 2; // itensity
	light.position.set(1, 1, 1);
	// add scene
	scene.add(light);

	// first run
	tick();

	function tick() {
		requestAnimationFrame(tick);

    // rotate the box
		box.rotation.x += 0.01;
		box.rotation.y += 0.01;

	// renderering
		renderer.render(scene, camera);
	}


	onResize();
	// リサイズイベント発生時に実行
	window.addEventListener('resize', onResize);

	function onResize() {
	// サイズを取得
	const width = window.innerWidth;
	const height = window.innerHeight;

	// レンダラーのサイズを調整する
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	// カメラのアスペクト比を正す
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	}
}