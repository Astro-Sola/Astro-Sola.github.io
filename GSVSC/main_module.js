//グローバル変数の皆様方
var backgroundcanvas;
var camera, controls, scene, renderer, labelRenderer;
var mesh;
var textlabels = [];


//携帯端末とPCの場合での条件分岐
function userConsole(){
  if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
  // スマホ・タブレット（iOS・Android）の場合の処理を記述
  return 10;
  }else{
  // PCの場合の処理を記述
  return 100;
  }
}

//getRandomArbitrary関数、指定した値の範囲内の数値を返す
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

//カメラ初期設定関数
function cameraSetup(){
  //カメラ作成、範囲指定
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000 * userConsole() );
  //カメラ初期座標
  camera.position.set(0, 20, 100);
  //カメラ制御
  cameraControls(camera);
  function cameraControls( camera ){
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    //カメラ移動速度
    controls.rotateSpeed = 1.2;
    controls.zoomSpeed = 0.6;
    controls.panSpeed = 0.2;
    //カメラ入力
    controls.key = [65, 83, 68];
    //カメラ限界ズーム
    controls.minDistance = 1;
    controls.maxDistance = 1000
  }
}

//ウィンドウ範囲リロード関数
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth , window.innerHeight );
}

//tick
function tick(){
  //レイキャストムーブメント
  //マウスクリック時に動作
  document.addEventListener('mousedown', onMouseMove, true);
  //レンダリング更新
  renderer.render(scene, camera);



  requestAnimationFrame(tick);
  //カメラコントロール更新
  controls.update();
}


//ネームドスターの生成
function generateNamedStars(geometry, starColor, defaultPosition, starName){
}

//レイキャスト
function onMouseMove(event){
}
//ページ読み込みまで待機
window.addEventListener('load', init);

//init関数
function init(){

  //canvasの生成
  backgroundcanvas = document.querySelector('#stellarCanvas');
 

  //レンダラーの作成
  renderer = new THREE.WebGLRenderer({
    canvas: backgroundcanvas,
    antialias: true,
    alphaTest: 0.2
  });

  //最初のリサイズ
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth , window.innerHeight );
  
  //シーンの生成
  scene = new THREE.Scene();

  //平面ガイド（グリッド）の生成
  var grid = new THREE.GridHelper(4000, 20);
  scene.add(grid);

  //カメラ初期化
  cameraSetup();

  //星の錬成
  



  //毎フレーム時の更新
  tick();

  //比率変更時のリサイズ
  //window.addEventListener( 'resize', onWindowResize, false );

  //リサイズ時のカメラコントロールハンドルの更新
  controls.handleResize();

}