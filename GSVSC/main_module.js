//ページ読み込みまで待機
window.addEventListener('load', init);

var camera, controls, scene, renderer;
var mesh;

//getRandomArbitrary関数、指定した値の範囲内の数値を返す
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

//init関数
function init(){

  //レンダラーの作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#stellarCanvas'), antialias: true
  });
  //最初のリサイズ
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth - 60, window.innerHeight - 120 );
  
  //シーンの作成
  scene = new THREE.Scene();

  //カメラ作成、範囲指定
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
  //カメラ初期座標
  camera.position.set(0, 20, 100);
  //カメラ制御
  cameraControls(camera);
  function cameraControls( camera ){
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    //カメラ移動速度
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 0.6;
    controls.panSpeed = 0.2;
    //カメラ入力
    controls.key = [65, 83, 68];
    //カメラ限界ズーム
    controls.maxDistance = 10;
    controls.maxDistance = 10000;
  }
  
  //ガイド
  var grid = new THREE.GridHelper(10000, 10);
  scene.add(grid);

  //背景の星屑生成
  generateBGStars();
  //generateStars
  function generateBGStars(){
    //形状データ作成
    var geometry = new THREE.Geometry();
    //配置範囲
    var SIZE = 500000;
    //配置個数
    var LENGTH = 100000;

    for (var i = 0; i < LENGTH; i++) {
      geometry.vertices.push(
        new THREE.Vector3(
          SIZE * (Math.random() - 0.5),
          SIZE * (Math.random() - 0.5),
          SIZE * (Math.random() - 0.5)
        ));
    }
    //マテリアル作成
    var mobStarMaterial = new THREE.PointsMaterial({
      //単体の大きさ
      size: getRandomArbitrary(1, 10),
      //テクスチャ（色と択一）
      map: new THREE.TextureLoader().load('img/star.png')
      //色
      //color: 0xffffff
    });
  //物体生成
  mesh = new THREE.Points(geometry, mobStarMaterial);
  scene.add(mesh);
  }

  //ネームされた星々の生成
  generateStars();
  function generateStars(){
    //マテリアル作成
    var starMaterial = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('img/star.png')
    });
    //スプライト（ビルボード）作成
    var starSprite = new THREE.Sprite(starMaterial);
    starSprite.position.set(10, 10, 10);
    scene.add(starSprite);
  }


  //毎フレーム時の更新
  tick();
  //tick
  function tick(){
    //レンダリング更新
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    //カメラコントロール更新
    controls.update();
  }

  //比率変更時のリサイズ
  window.addEventListener( 'resize', onWindowResize, false );
  //リサイズ時のカメラコントロールハンドルの更新
  controls.handleResize();

}


//ウィンドウ範囲リロード関数
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth - 100, window.innerHeight - 100);
}