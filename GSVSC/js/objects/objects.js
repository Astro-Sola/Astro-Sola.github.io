import * as THREE from 'three';
export class Star {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.name_en = data.name_en;
    this.position = new THREE.Vector3().fromArray(data.position);
    this.spec_type = data.spec_type;
    this.size = data.size;
    this.luminosity = data.luminosity;
    this.connect = data.connect;
    this.nations = data.nations;
    this.planet = data.planet;
    this.overview = data.overview;
  }
}

function setSpectralColor(spectralType) {
  if (!spectralType) {
    return 0xffffff; // デフォルトの白色
  }
  let colorCode = 0xff00ff;
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
  return colorCode;
}


export function createStarsys(data) {
  const texture = new THREE.TextureLoader().load('../assets/images/star.png');
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({transparent: true, depthTest: true, depthWrite: false, depthFunc: THREE.AdditiveBlending});
  material.map = texture;
  const points = new THREE.Points(geometry, material);
  
  const star = new Star(data);
  points.userData.star = star;

  const position = new THREE.Vector3().fromArray(data.position);
  position.multiplyScalar(1);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position.toArray(), 3));
  material.size = star.size;
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

