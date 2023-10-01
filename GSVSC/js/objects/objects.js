// Star.js
import * as THREE from 'three';

export class Star {
  constructor(data) {
    // 恒星のID
    this.id = data.id;
    // 恒星の名前
    this.name = data.name;
    // 恒星の英語名
    this.name_en = data.name_en;
    // 恒星の位置
    this.position = new THREE.Vector3().fromArray(data.position);
    // 恒星の分光型
    this.spec_type = data.spec_type;
    // 恒星の大きさ
    this.size = data.size;
    // 恒星の明るさ
    this.luminosity = data.luminosity;
    // 恒星の接続先
    this.connect = data.connect;
    // 恒星の領有国
    this.nations = data.nations;
    // 恒星の持つ惑星数
    this.planet = data.planet;
    // 恒星の概要
    this.overview = data.overview;
  }
}

function setSpectralColor(spectralType) {
  // 色コードを初期化
  let colorCode = 0xffffff;

  // 輝星の分光型から色を決定する
  let type = spectralType.match(/[OBAFGKM]/);
  if (type) {
    switch(type[0]) {
      case 'O':
        colorCode = 0x9bb0ff; // 青白色
        break;
      case 'B':
        colorCode = 0xaabfff; // 青色
        break;
      case 'A':
        colorCode = 0xcad7ff; // 白色
        break;
      case 'F':
        colorCode = 0xf8f7ff; // 黄白色
        break;
      case 'G':
        colorCode = 0xfff4ea; // 黄色
        break;
      case 'K':
        colorCode = 0xffddaa; // 橙色
        break;
      case 'M':
        colorCode = 0xff9c71; // 赤色
        break;
      default:
        colorCode = 0xffffff;
        break;
    }
  }

  // 決定した色コードを返す
  return colorCode;
}


export function createStarsys(data) {
  // 恒星のテクスチャ画像のロード
  const texture = new THREE.TextureLoader().load('../assets/images/star.png'); 
  // ポイントのジオメトリを作成
  const geometry = new THREE.BufferGeometry();
  // ポイントのマテリアルを作成
  const material = new THREE.PointsMaterial({
    transparent: true, 
    depthTest: true, 
    depthWrite: false, 
    depthFunc: THREE.AdditiveBlending
  });
  // マテリアルにテクスチャ画像を設定
  material.map = texture;
  // ポイントオブジェクトを作成
  const points = new THREE.Points(geometry, material);
  // 恒星オブジェクトを作成
  const star = new Star(data);
  // ユーザーデータに恒星オブジェクトを設定
  points.userData.star = star;
  
  // ポイントの位置を設定
  const position = new THREE.Vector3().fromArray(data.position);
  position.multiplyScalar(1);
  // ポイントのジオメトリに位置情報を設定
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position.toArray(), 3));
  // マテリアルのサイズを恒星のサイズに設定
  material.size = star.size;
  // 恒星の分光型から色を設定
  const colorCodeHex = setSpectralColor(star.spec_type);
  material.color.setHex(colorCodeHex);
  return points;
}

export function deleteClosePoint(scene, pointsList, point, THRESHOLD){
  const currentPos = point.geometry.getAttribute('position').array; // 現在生成した点の位置
    let isVisible = true; // 今回生成した点が可視であるかどうかを判定するためのフラグ
    for (let i = 0; i < pointsList.length; i++) {
      const pastPos = pointsList[i].geometry.getAttribute('position').array;
      const distance = Math.sqrt(Math.pow(currentPos[0] - pastPos[0], 2) + Math.pow(currentPos[1] - pastPos[1], 2) + Math.pow(currentPos[2] - pastPos[2], 2));
      if (distance < THRESHOLD) { // 距離が閾値以下の場合
        point.material.visible = false;
        isVisible = false;
        break;
      }
    }
    if (isVisible) {
      pointsList.push(point);
    }
    scene.add(point);
}