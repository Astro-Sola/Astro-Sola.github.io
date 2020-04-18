//ページ読み込みまで待機
window.addEventListener('load', init);

var camera, scene, renderer;
var mesh;

//init関数
function init(){
  //レンダラーの作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#stellarCanvas'), antialias: true
  });
  //最初のリサイズ
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth - 100, window.innerHeight - 100 );
  //シーンの作成
  scene = new THREE.Scene();
  //カメラ作成、範囲指定
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  //カメラ初期座標
  camera.position.set(0, 0, 1000);
  //カメラ制御
  const controls = new THREE.OrbitControls(camera, renderer.domElement);


  //星屑
  generateStars();
  //generateStars
  function generateStars(){
    //形状データ作成
    const geometry = new THREE.Geometry();
    //配置範囲
    var SIZE = 3000;
    //配置個数
    var LENGTH = 1000;

    for (var i = 0; i < LENGTH; i++) {
      geometry.vertices.push(
        new THREE.Vector3(
          SIZE * (Math.random() - 0.5),
          SIZE * (Math.random() - 0.5),
          SIZE * (Math.random() - 0.5)
        ));
    }
    //マテリアル作成
    var material = new THREE.PointsMaterial({
      //単体の大きさ
      size: 10,
      //色
      color: 0xffffff
    });
  //物体生成
  mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
  }

  //毎フレーム時に実行する
  tick();
  //tick
  function tick(){
    //レンダリング
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  //比率変更時のリサイズ
  window.addEventListener( 'resize', onWindowResize, false );
}


//ウィンドウ範囲リロード関数
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth - 100, window.innerHeight - 100);
}