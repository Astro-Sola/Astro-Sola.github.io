//ページ読み込みまで待機
window.addEventListener('load', init);

var x, y, z;
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
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
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
    controls.maxDistance = 1000;
  }
  
  //ガイド
  var grid = new THREE.GridHelper(1000, 10);
  scene.add(grid);

  //星の生成を行う関数
  function generateStars(x,y,z){
    //マテリアル作成
    var starMaterial = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('img/star.png')
      //color: 0xffffff
    });
    //スプライト（ビルボード）作成
    var starSprite = new THREE.Sprite(starMaterial);
    starSprite.position.set(x, y, z);
    scene.add(starSprite);
  }

  //星の生成
  var STARSUM = 1000;//星の総数
  var STARSPREAD = 1000;//星の広がり
  for (var i = 0; i < STARSUM; i++) {
    x = STARSPREAD * ((Math.random()-0.5)*2);
    y = STARSPREAD * ((Math.random()-0.5)*2);
    z = STARSPREAD * ((Math.random()-0.5)*2);
    generateStars(x,y,z);
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