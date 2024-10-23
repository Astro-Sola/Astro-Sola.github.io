import * as THREE from 'three';

interface OrbitData {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  argumentOfPeriapsis: number;
}

interface TagLODLevel {
  minDistance: number;
  maxDistance: number;
  scaleMultiplier: number;
  contentType: 'full' | 'compact' | 'minimal';
}

export interface CelestialBodyData {
  name: string;
  type: 'star' | 'planet' | 'moon';
  radius: number;
  color: string;
  textureUrl?: string;
  mass: number;
  orbitalPeriod: number;
  rotationPeriod: number;
  orbitData?: {
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    longitudeOfAscendingNode: number;
    argumentOfPeriapsis: number;
  };
  averageTemperature?: number;
}

const textureLoader = new THREE.TextureLoader();

export class CelestialBody {
  private scaleFactor: number = 1e-4;
  protected data: CelestialBodyData;
  protected mesh: THREE.Mesh;
  private highlightMesh: THREE.Mesh;
  private orbit: THREE.Object3D | null = null;
  private orbitLine: THREE.Line | null = null;
  private isOrbitVisible: boolean = true;
  private isTrailVisible: boolean = true;
  private isHighlighted: boolean = false;
  private isTagVisible: boolean = true; 
  private trailLength: number = 1000;
  private trail: THREE.Line | null = null;  
  private trailPositions: THREE.Vector3[] = [];
  private trailInitialized: boolean = false;
  private readonly MAX_TRAIL_LENGTH = 1000;
  protected scene: THREE.Scene;
  protected texture: THREE.Texture | null = null;
  private tagMesh: THREE.Sprite;

  constructor(data: CelestialBodyData, scene: THREE.Scene) {
    this.data = data;
    this.scene = scene;
    this.trail = this.initTrail();
    this.loadTexture();
    this.mesh = this.createMesh();
    
    if (this.data.orbitData) {
        this.createOrbit();
        this.setInitialPosition();
    }
    this.highlightMesh = this.createHighlightMesh();
    scene.add(this.mesh);
    this.mesh.add(this.highlightMesh);
    this.applyScale();

    // タグメッシュを作成してシーンに直接追加
    // タグメッシュを作成してシーンに直接追加
    this.tagMesh = this.createTagMesh();
    this.tagMesh.visible = this.isTagVisible;  // 初期状態を設定
    scene.add(this.tagMesh);

    // タグの初期位置を設定
    this.tagMesh.position.copy(this.mesh.position);
    this.tagMesh.position.y += this.data.radius * 2;
    
    // デバッグ情報
    console.log(`Created tag for ${this.data.name}:`, {
        position: this.tagMesh.position,
        scale: this.tagMesh.scale,
        visible: this.tagMesh.visible
    });
}

  private readonly TAG_LOD_LEVELS: TagLODLevel[] = [
    { minDistance: 0, maxDistance: 1000, scaleMultiplier: 0.6, contentType: 'full' },
    { minDistance: 1000, maxDistance: 5000, scaleMultiplier: 0.8, contentType: 'full' },
    { minDistance: 5000, maxDistance: 20000, scaleMultiplier: 1.0, contentType: 'compact' },
    { minDistance: 20000, maxDistance: 1000000, scaleMultiplier: 1.2, contentType: 'minimal' }
  ];

  private getCurrentLODLevel(distance: number): TagLODLevel {
    return this.TAG_LOD_LEVELS.find(level => 
      distance >= level.minDistance && distance < level.maxDistance
    ) || this.TAG_LOD_LEVELS[this.TAG_LOD_LEVELS.length - 1];
  }

private loadTexture(): void {
    if (this.data.textureUrl) {
      textureLoader.load(
        this.data.textureUrl,
        (texture) => {
          this.texture = texture;
          if (this.mesh.material instanceof THREE.MeshBasicMaterial) {
            this.mesh.material.map = this.texture;
            this.mesh.material.needsUpdate = true;
          }
        },
        undefined,
        (error) => {
          console.error(`Error loading texture for ${this.data.name}:`, error);
        }
      );
    }
  }

  public setOrbitVisibility(visible: boolean): void {
    this.isOrbitVisible = visible;
    if (this.orbitLine) {
      this.orbitLine.visible = visible;
    }
  }

  public setTrailVisibility(visible: boolean): void {
    this.isTrailVisible = visible;
    if (this.trail) {
      this.trail.visible = visible && this.trailInitialized;
    }
  }

  public setTagVisibility(visible: boolean): void {
        this.isTagVisible = visible;
        this.tagMesh.visible = visible;
        console.log(`Setting tag visibility for ${this.data.name} to:`, visible);  // デバッグ用
    }

  public setTrailLength(length: number): void {
    this.trailLength = Math.min(length, this.MAX_TRAIL_LENGTH);
    this.trailPositions = this.trailPositions.slice(-this.trailLength);
    this.updateTrail();
  }

  private setInitialPosition(): void {
    if (this.data.orbitData) {
      const initialPosition = this.calculatePosition(0);
      this.mesh.position.copy(initialPosition);
    }
  }

  protected createMesh(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(this.data.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: this.data.color,
      map: this.texture,
      shininess: 5
    });
    return new THREE.Mesh(geometry, material);
  }

  private createHighlightMesh(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(this.data.radius * 1.05, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffff00, 
      transparent: true, 
      opacity: 0.3 
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    return mesh;
  }

  private applyScale(): void {
    this.mesh.scale.multiplyScalar(this.scaleFactor);
    if (this.orbit) {
      this.orbit.scale.multiplyScalar(this.scaleFactor);
    }
  }

  private initTrail(): THREE.Line {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ 
      color: this.data.color, 
      opacity: 0.5, 
      transparent: true,
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    trail.visible = false; // 初期状態では非表示
    this.scene.add(trail);
    return trail;
  }

  private createOrbit(): void {
    if (this.data.orbitData) {
      const { semiMajorAxis, eccentricity } = this.data.orbitData;
      const points = this.generateOrbitPoints(semiMajorAxis, eccentricity, 1000);
      
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
      this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

      this.orbit = new THREE.Object3D();
      this.orbit.add(this.orbitLine);

      // 軌道面の回転を適用
      this.applyOrbitRotation();
    }
  }

  // createTagMesh メソッドを修正
  private createTagMesh(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 200;  // 高さを調整

    if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // 接続線を描画（シンプルな垂直線）
        context.beginPath();
        context.moveTo(canvas.width / 2, 50);  // テキストエリアの下
        context.lineTo(canvas.width / 2, canvas.height);  // 最下部まで
        context.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        context.lineWidth = 2;
        context.stroke();

        // テキストの背景
        const textAreaHeight = 50;
        const textAreaY = 0;
        context.fillStyle = 'rgba(0, 20, 40, 0.8)';
        context.roundRect(10, textAreaY, canvas.width - 20, textAreaHeight, 10);
        context.fill();

        // 名前を描画
        context.fillStyle = '#ffffff';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.data.name, canvas.width / 2, textAreaY + 15);

        // タイプを描画
        context.font = '20px Arial';
        context.fillStyle = '#88ccff';
        context.fillText(this.data.type.toUpperCase(), canvas.width / 2, textAreaY + 35);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        sizeAttenuation: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.center.set(0.5, 0);  // アンカーポイントを下部中央に
    sprite.renderOrder = 999999;
    
    return sprite;
}

  private applyOrbitRotation(): void {
    if (this.orbit && this.data.orbitData) {
      const { inclination, longitudeOfAscendingNode, argumentOfPeriapsis } = this.data.orbitData;
      this.orbit.rotation.set(0, 0, 0); // リセット
      this.orbit.rotateZ(longitudeOfAscendingNode * Math.PI / 180);
      this.orbit.rotateX(inclination * Math.PI / 180);
      this.orbit.rotateZ(argumentOfPeriapsis * Math.PI / 180);
    }
  }

  private generateOrbitPoints(semiMajorAxis: number, eccentricity: number, segments: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(angle));
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
  }

  public getOrbit(): THREE.Object3D | null {
    return this.orbit;
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getOrbitLine(): THREE.Line | null {
    return this.orbitLine;
  }
  
  public getTrail(): THREE.Line | null {  // 戻り値の型を更新
    return this.trail;
  }

  public getName(): string {
    return this.data.name;
  }

  public getType(): string {
    return this.data.type;
  }

  public getRadius(): number {
    return this.data.radius;
  }

  public getMass(): number {
    return this.data.mass;
  }

  public getAverageTemperature(): number | undefined {
    return this.data.averageTemperature;
  }

  public getColor(): string {
    return this.data.color;
  }

  public getInfo(): string {
    return `Type: ${this.data.type}
Radius: ${this.data.radius.toLocaleString()} km
Mass: ${this.data.mass.toExponential(2)} kg
Rotation Period: ${this.data.rotationPeriod.toFixed(3)} Earth days
${this.data.averageTemperature !== undefined ? `Average Temperature: ${this.data.averageTemperature}°C` : ''}`;
  }

  public getTagMesh(): THREE.Sprite {
    return this.tagMesh;
  }

  public setHighlight(highlight: boolean): void {
    if (this.isHighlighted === highlight) {
        return;
    }

    this.isHighlighted = highlight;
    this.highlightMesh.visible = highlight;

    // タグのハイライト効果をより控えめに
    if (highlight) {
        const scale = this.tagMesh.scale.x;
        this.tagMesh.scale.setScalar(scale * 1.05);  // スケール変更を控えめに
    } else {
        const scale = this.tagMesh.scale.x;
        this.tagMesh.scale.setScalar(scale / 1.05);
    }
}

  private degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculatePosition(time: number): THREE.Vector3 {
    if (!this.data.orbitData) {
      return new THREE.Vector3(0, 0, 0);
    }

    const { semiMajorAxis, eccentricity, inclination, longitudeOfAscendingNode, argumentOfPeriapsis } = this.data.orbitData;
    const inclinationRad = this.degToRad(inclination);
    const longitudeOfAscendingNodeRad = this.degToRad(longitudeOfAscendingNode);
    const argumentOfPeriapsisRad = this.degToRad(argumentOfPeriapsis);

    const meanMotion = 2 * Math.PI / this.data.orbitalPeriod;
    const meanAnomaly = meanMotion * time;
    
    // 離心近点角（E）を計算
    let E = meanAnomaly;
    for (let i = 0; i < 10; i++) {
      E = E - (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    }
    
    // 真近点角（ν）を計算
    const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(E / 2));
    
    // 軌道面上の位置を計算
    const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
    const x = r * Math.cos(trueAnomaly);
    const y = r * Math.sin(trueAnomaly);

    // 軌道面から空間座標への変換
    const cosLOAN = Math.cos(longitudeOfAscendingNodeRad);
    const sinLOAN = Math.sin(longitudeOfAscendingNodeRad);
    const cosI = Math.cos(inclinationRad);
    const sinI = Math.sin(inclinationRad);
    const cosAOP = Math.cos(argumentOfPeriapsisRad);
    const sinAOP = Math.sin(argumentOfPeriapsisRad);

    const xSpace = (cosLOAN * cosAOP - sinLOAN * sinAOP * cosI) * x
                 + (-cosLOAN * sinAOP - sinLOAN * cosAOP * cosI) * y;
    const ySpace = (sinLOAN * cosAOP + cosLOAN * sinAOP * cosI) * x
                 + (-sinLOAN * sinAOP + cosLOAN * cosAOP * cosI) * y;
    const zSpace = (sinAOP * sinI) * x + (cosAOP * sinI) * y;

    return new THREE.Vector3(xSpace, ySpace, zSpace).multiplyScalar(this.scaleFactor);
  }
  
  public update(time: number, camera: THREE.Camera): void {
    if (this.orbit && this.data.orbitData && this.data.orbitalPeriod > 0) {
      const position = this.calculatePosition(time);
      this.mesh.position.copy(position);
    } else if (this.data.type === 'star') {
      this.mesh.position.set(0, 0, 0);
    }
  
    if (this.data.rotationPeriod > 0) {
      const rotationAngle = (2 * Math.PI * time) / this.data.rotationPeriod;
      this.mesh.rotation.y = rotationAngle;
    }
  
    this.updateTrail();
    this.updateHighlight();
    this.updateTagPosition(camera);
  }

  public updateTrail(): void {
    if (!this.isTrailVisible || !this.trail) return;  // null チェックを追加
    
    const position = this.mesh.position.clone();
    
    if (!isNaN(position.x) && !isNaN(position.y) && !isNaN(position.z)) {
      if (!this.trailInitialized) {
        // トレイルが初期化されていない場合、現在の位置で初期化
        this.trailPositions = [position, position];
        this.trailInitialized = true;
      } else {
        this.trailPositions.push(position);
        if (this.trailPositions.length > this.trailLength) {
          this.trailPositions.shift();
        }
      }
      
      (this.trail.geometry as THREE.BufferGeometry).setFromPoints(this.trailPositions);
      
      // トレイルが初期化され、かつ表示設定がtrueの場合にのみ表示
      this.trail.visible = this.isTrailVisible && this.trailInitialized;
    } else {
      console.error(`Invalid trail position for ${this.data.name}: ${position.toArray()}`);
    }
  }

  private updateHighlight(): void {
    if (this.highlightMesh) {
      this.highlightMesh.visible = this.isHighlighted;
    }
  }

  private updateTagContent(lodLevel: TagLODLevel): void {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 200;
  
    if (!context) return;
  
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // 接続線を描画（透明度を調整）
    context.beginPath();
    context.moveTo(canvas.width / 2, 50);
    context.lineTo(canvas.width / 2, canvas.height);
    context.strokeStyle = 'rgba(255, 255, 255, 0.6)';  // 透明度を上げる
    context.lineWidth = 2;
    context.stroke();
  
    // 背景（透明度を調整）
    context.fillStyle = 'rgba(0, 20, 40, 0.9)';  // 透明度を下げる
    const textAreaHeight = lodLevel.contentType === 'minimal' ? 30 : 50;
    context.roundRect(10, 0, canvas.width - 20, textAreaHeight, 10);
    context.fill();
  
    // コンテンツタイプに応じて表示内容を変更（フォントサイズを調整）
    context.textAlign = 'center';
    switch (lodLevel.contentType) {
      case 'full':
        context.font = 'bold 36px Arial';  // フォントサイズを大きく
        context.fillStyle = '#ffffff';
        context.fillText(this.data.name, canvas.width / 2, 25);
        context.font = '24px Arial';
        context.fillStyle = '#88ccff';
        context.fillText(this.data.type.toUpperCase(), canvas.width / 2, 45);
        break;
        
      case 'compact':
        context.font = 'bold 32px Arial';
        context.fillStyle = '#ffffff';
        context.fillText(this.data.name, canvas.width / 2, 30);
        break;
        
      case 'minimal':
        context.font = 'bold 28px Arial';
        context.fillStyle = '#ffffff';
        context.fillText(this.data.name, canvas.width / 2, 20);
        break;
    }
  
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    if (this.tagMesh.material instanceof THREE.SpriteMaterial) {
      this.tagMesh.material.map?.dispose();
      this.tagMesh.material.map = texture;
      this.tagMesh.material.needsUpdate = true;
    }
  }

  // updateTagPosition メソッドを修正
  public updateTagPosition(camera: THREE.Camera): void {
    if (!this.tagMesh || !this.mesh) return;
  
    const worldPos = this.mesh.getWorldPosition(new THREE.Vector3());
    const distance = camera.position.distanceTo(worldPos);
    
    // 現在のLODレベルを取得
    const lodLevel = this.getCurrentLODLevel(distance);
    
    // カメラまでの距離に基づいて基本スケールを計算
    // スケール計算の係数を調整
    const baseScale = Math.min(
      0.5 * Math.log10(distance + 1),
      10.0
    ) * this.scaleFactor * 10000;
    
    // LODレベルに基づいてスケールを調整
    const finalScale = baseScale * lodLevel.scaleMultiplier;
    
    // スケールを適用（横方向は2倍に）
    this.tagMesh.scale.set(finalScale * 2, finalScale, 1);
    
    // タグの位置を更新（オフセット計算を改善）
    const offsetMultiplier = Math.max(
      this.data.radius * this.scaleFactor * 3,
      distance * 0.01
    );
    const tagOffset = Math.max(
      this.data.radius * this.scaleFactor * 3,
      offsetMultiplier
    );
    
    this.tagMesh.position.copy(worldPos);
    this.tagMesh.position.y += tagOffset;
    
    // カメラに向ける
    this.tagMesh.lookAt(camera.position);
    
    // タグの内容を更新
    this.updateTagContent(lodLevel);
    
    // 表示/非表示の制御（距離閾値を大きく）
    this.tagMesh.visible = this.isTagVisible && distance < 1000000;
  }

  private updateTagScale(sprite: THREE.Sprite, camera?: THREE.Camera): void {
  if (!camera) return;
  
  const distance = camera.position.distanceTo(this.mesh.position);
  const scale = Math.max(50, distance * 0.05); // 距離に応じてスケールを調整
  sprite.scale.set(scale, scale, 1);
}

  public dispose(): void {
    // メッシュを削除
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    }

    // ハイライトメッシュを削除
    if (this.highlightMesh.parent) {
      this.highlightMesh.parent.remove(this.highlightMesh);
    }
    if (this.highlightMesh.geometry) {
      this.highlightMesh.geometry.dispose();
    }
    if (this.highlightMesh.material instanceof THREE.Material) {
      this.highlightMesh.material.dispose();
    }

    // テクスチャを解放
    if (this.texture) {
      this.texture.dispose();
    }

    // 軌道線を削除（存在する場合）
    if (this.orbitLine) {
      if (this.orbitLine.parent) {
        this.orbitLine.parent.remove(this.orbitLine);
      }
      if (this.orbitLine.geometry) {
        this.orbitLine.geometry.dispose();
      }
      if (this.orbitLine.material instanceof THREE.Material) {
        this.orbitLine.material.dispose();
      }
    }

    // トレイルを削除（存在する場合）
    if (this.trail) {
      if (this.trail.parent) {
        this.trail.parent.remove(this.trail);
      }
      if (this.trail.geometry) {
        this.trail.geometry.dispose();
      }
      if (this.trail.material instanceof THREE.Material) {
        this.trail.material.dispose();
      }
    }

    console.log(`Disposed resources for ${this.data.name}`);
  }
}