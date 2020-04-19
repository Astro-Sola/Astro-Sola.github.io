//ページ読み込みまで待機
window.addEventListener('load', init);

var camera, scene, renderer;
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
  renderer.setSize( window.innerWidth - 20, window.innerHeight - 20 );
  //シーンの作成
  scene = new THREE.Scene();
  //カメラ作成、範囲指定
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  //カメラ初期座標
  camera.position.set(0, 200, 1000);
  //カメラ制御
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  //ガイド
  var gridHelper = new THREE.GridHelper( 2000, 10 );
  scene.add( gridHelper );

  //背景の星屑生成
  generateBGStars();
  //generateStars
  function generateBGStars(){
    //形状データ作成
    var geometry = new THREE.Geometry();
    //配置範囲
    var SIZE = 50000;
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
      //色
      color: 0xffffff
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