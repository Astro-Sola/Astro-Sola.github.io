////////////////////////////
/*メインプログラムはここから*/
////////////////////////////
//CSVを配列にする
function main(){
  var starList;
  var require = new XMLHttpRequest();
  require.open("get", "StarList.csv", true);
  require.send(null);
  require.onload = function(){
    starList = CSVtoArrayConverter(require.responseText);
    console.log(starList);

      /*初回起動時の動作*/

      //マウス座標
      var mousePosition = new THREE.Vector2();
      //キャンバスの指定
      var canvas = document.querySelector('#stellarCanvas');
      //画面比率
      var windowRatio = window.innerWidth / window.innerHeight;
      //レンダラーの設定
      var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth,window.innerHeight);
      document.body.appendChild(renderer.domElement);
      //シーンの設定
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      //カメラの設定
      var camera = new THREE.PerspectiveCamera(50, windowRatio, 1, 1000);
      camera.position.set(15, 15, 15);
      camera.lookAt(scene.position);
      //カメラコントロールの設定
      var cameraControl = new THREE.TrackballControls(camera, renderer.domElement);
      cameraControl.rotateSpeed = 1.2;
      cameraControl.zoomSpeed = 0.6;
      //カメラの入力キーの設定
      cameraControl.key = [65, 83, 68];
      //カメラの最大最小距離の設定
      cameraControl.minDistance = 1;
      cameraControl.maxDistance = 1000;

      //グループの生成
      var objectGroup = new THREE.Group();
      scene.add(objectGroup);

      //スプライトの生成
      console.log(starList);
      generateSprite(objectGroup, starList);
      console.log(objectGroup);

      //レイキャストの生成
      var raycaster = new THREE.Raycaster();

      /*マウスがキャンバス上で動いたときの関数ここから*/
      function onMouseMove(event){
        var element = event.currentTarget;
        // canvas要素上のXY座標
        var x = event.clientX - element.offsetLeft;
        var y = event.clientY - element.offsetTop;
        // canvas要素の幅・高さ
        var w = element.offsetWidth;
        var h = element.offsetHeight;
        // -1〜+1の範囲で現在のマウス座標を登録する
        mousePosition.x = (x / w) * 2 - 1;
        mousePosition.y = -(y / h) * 2 + 1;
      }
      /*マウスがキャンバス上で動いたときの関数ここまで*/

      //マウスが動いたときに以下を実効
      canvas.addEventListener("mousemove", onMouseMove);

      //グリッド描画
      var gridHelper = new THREE.GridHelper( 10, 10 );
      scene.add( gridHelper );

      /*ここまで初回起動時*/

      /*以下それ以降*/
      /*毎tickごとの関数ここから*/
      function tick(){
        raycaster.setFromCamera( mousePosition, camera );
        var intersects = raycaster.intersectObjects(objectGroup.children);
        var selectedObjectColor, selectedObjectName;

        objectGroup.children.map(sprite => {
          //交差しているオブジェクトが１つ以上あって、それが最前面
          if(intersects.length > 0 && sprite === intersects[0].object){
            selectedObjectColor = sprite.material.color.clone();
            selectedObjectName = sprite.name;
            sprite.material.color.set(0xff0000);
          } else {
            sprite.material.color.set(0x00ff00)
          }
        });
        console.log(objectGroup.children);
        
        cameraControl.update();
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      }
      tick();
      /*毎tickごとの関数ここまで*/
  }
}
main();
////////////////////////////
/*メインプログラムはここまで*/
////////////////////////////

function CSVtoArrayConverter(string){
  var convertedArray = [];
  var template = string.split("\n");//改行で配列分割

  for(var i=0;i<template.length;++i){
      convertedArray[i] = template[i].split(',');//コンマで配列分割
  }
  for (let i = 1; i < convertedArray.length; i++) {
    convertedArray[i][1] = parseInt(convertedArray[i][1],10);
    convertedArray[i][2] = parseInt(convertedArray[i][2],10);
    convertedArray[i][3] = parseInt(convertedArray[i][3],10);
    convertedArray[i][8] = parseInt(convertedArray[i][8],10);
  }
  return convertedArray;
}
/*CSVを配列にする関数ここまで*/

/*スプライト生成関数ここから*/
function generateSprite(group, objectList){
  for(var i=1;i<objectList.length;i++){
    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x0000ff }));
    sprite.position.set(objectList[i][1], objectList[i][2], objectList[i][3]);
    sprite.name = objectList[i][0];
    group.add(sprite);
  }
}
/*スプライト生成関数ここまで*/