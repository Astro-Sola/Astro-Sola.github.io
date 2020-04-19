//携帯端末とPCの場合での条件分岐
function userConsole(){
  if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
  // スマホ・タブレット（iOS・Android）の場合の処理を記述
  return 1;
  }else{
  // PCの場合の処理を記述
  return 10;
  }
}

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
  renderer.setSize( window.innerWidth - 120 * (window.innerWidth / window.innerHeight), window.innerHeight - 120 );
  


  //シーンの作成
  scene = new THREE.Scene();



  //カメラ作成、範囲指定
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000 * userConsole() );
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
    controls.minDistance = 10;
    controls.maxDistance = 100 * userConsole();
  }


  
  //ガイド
  var grid = new THREE.GridHelper(1000, 10);
  scene.add(grid);



  //モブの恒星の追加を行う関数
  function generateMobStars(){
    //テクスチャ指定
    var loader = new THREE.TextureLoader();
    var texture = loader.load('img/star.png');
    //モブ恒星マテリアル
    var mobStarMaterial = new THREE.PointsMaterial({
      //color: 0xffffff,
      map: texture,
      size: 10,
      blending: THREE.additiveBlending,
      transparent: true,
      depthTest: false
    });
    //モブ恒星の数と範囲
    var STARSUM = 100000;//星の総数
    var STARSPREAD = 2000;//星の広がり
    //モブ恒星のジオメトリ
    mobStarGeomrtry = new THREE.Geometry();
    for (var i = 0; i < STARSUM; i++) {
      var x,y; 
      //極座標パラメータ
      var r = Math.random();
      var z = getRandomArbitrary(-1, 1);
      var phi = getRandomArbitrary(0, 2 * Math.PI);
      //直交座標系へ返還し設置位置として格納
      mobStarGeomrtry.vertices.push(
        new THREE.Vector3(
          x = Math.cbrt(r) * STARSPREAD * Math.sqrt(1 - z * z) * Math.cos(phi),
          y = Math.cbrt(r) * STARSPREAD * Math.sqrt(1 - z * z) * Math.sin(phi),
          z = Math.cbrt(r) * STARSPREAD * z
          )
        );
    }
    var mobStar = new THREE.Points(mobStarGeomrtry, mobStarMaterial);
    scene.add(mobStar);
  }
  generateMobStars();



  //ネームド星系の生成を行う関数
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