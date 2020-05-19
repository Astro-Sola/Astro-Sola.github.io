


//グローバル変数の皆様方
var camera, controls, scene, renderer;
var mesh;


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


//ページ読み込みまで待機
window.addEventListener('load', init);

//getRandomArbitrary関数、指定した値の範囲内の数値を返す
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

//init関数
function init(){



  //レンダラーの作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#stellarCanvas'),
    antialias: true,
    alphaTest: 0.2
  });



  //最初のリサイズ
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth - 40 * (window.innerWidth / window.innerHeight), window.innerHeight - 40 );
  


  //シーンの作成
  scene = new THREE.Scene();



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
    controls.minDistance = 10;
    controls.maxDistance = 1000
  }


  
  //ガイド
  var grid = new THREE.GridHelper(4000, 20);
  scene.add(grid);



  //ネームドスターの生成
  function GenerateNamedStars(){
    //ジオメトリの作成
    var geometry = new THREE.IcosahedronGeometry( 1, 2 );
    //マテリアルの作成
    var material = new THREE.MeshBasicMaterial( { color: 0xffeecc } );
    //メッシュを特定個数作成
    for (var i = 0; i < 1000; i++) {
      var star = new THREE.Mesh( geometry, material );
        star.position.x = ((Math.random() - 0.5) * 100);
        star.position.y = ((Math.random() - 0.5) * 100);
        star.position.z = ((Math.random() - 0.5) * 100);
        console.log(i);
        //モデル読み込み
        scene.add( star );
    }
  }

  GenerateNamedStars();


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

  renderer.setSize(window.innerWidth - 40 * (window.innerWidth / window.innerHeight), window.innerHeight - 40);
}