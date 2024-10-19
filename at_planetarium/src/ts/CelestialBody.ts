import * as THREE from 'three';

interface OrbitData {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  argumentOfPeriapsis: number;
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
  private clickMesh: THREE.Mesh;
  private highlightMesh: THREE.Mesh;
  private minClickSize: number;
  private maxClickSize: number;
  private orbit: THREE.Object3D | null = null;
  private orbitLine: THREE.Line | null = null;
  private isOrbitVisible: boolean = true;
  private isTrailVisible: boolean = true;
  private isHighlighted: boolean = false;
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
    this.minClickSize = this.data.radius * 200; // 最小クリックサイズを設定
    this.maxClickSize = this.data.radius * 1000; // 最大クリックサイズを設定
    this.clickMesh = this.createClickMesh();
    this.clickMesh.visible = true;  // 明示的に可視性を設定
    this.highlightMesh = this.createHighlightMesh();
    this.mesh.add(this.clickMesh);
    scene.add(this.mesh);
    this.mesh.add(this.highlightMesh);
    this.applyScale();
    this.tagMesh = this.createTagMesh();
    this.mesh.add(this.tagMesh);
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
    this.tagMesh.visible = visible;
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

  private createClickMesh(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.0 //ここでコライダーの可視の是非が決まる
    });
    const mesh = new THREE.Mesh(geometry,material);
    mesh.visible = true;
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

  private createTagMesh(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    if (context) {
      context.fillStyle = '#ffffff';
      context.font = 'Bold 20px Arial';
      context.fillText(this.data.name, 128, 128);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 10, 1);  // タグのサイズを調整
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

  public getClickMesh(): THREE.Mesh {
    return this.clickMesh;
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
    if (this.isHighlighted !== highlight) {
      this.isHighlighted = highlight;
      this.highlightMesh.visible = highlight;
      
      // ハイライト効果を強化
      if (highlight) {
        this.highlightMesh.scale.setScalar(1.2); // 20%大きく
        (this.highlightMesh.material as THREE.MeshBasicMaterial).opacity = 0.5; // より不透明に
      } else {
        this.highlightMesh.scale.setScalar(1);
        (this.highlightMesh.material as THREE.MeshBasicMaterial).opacity = 0.3;
      }
      
      console.log(`Highlight set to ${highlight} for ${this.data.name}`);
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
      this.clickMesh.position.copy(position);
    } else if (this.data.type === 'star') {
      this.mesh.position.set(0, 0, 0);
      this.clickMesh.position.set(0, 0, 0);
    }
  
    if (this.data.rotationPeriod > 0) {
      const rotationAngle = (2 * Math.PI * time) / this.data.rotationPeriod;
      this.mesh.rotation.y = rotationAngle;
    }
  
    this.updateTrail();
    this.updateClickMeshSize(camera);
    this.updateHighlight();
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

  public updateClickMeshSize(camera: THREE.Camera): void {
    const distance = this.mesh.position.distanceTo(camera.position);
    const baseSize = 1e5; // より小さな基本サイズ
  
    const size = THREE.MathUtils.clamp(
      distance * 1, // 距離によるサイズ変化を小さく
      baseSize * 1e2,    // 最小サイズ
      baseSize * 1e5    // 最大サイズも抑える
    );
  
    this.clickMesh.scale.setScalar(size);
  }
  
  private updateHighlight(): void {
    if (this.highlightMesh) {
      this.highlightMesh.visible = this.isHighlighted;
    }
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

    // クリックメッシュを削除（存在する場合）
    if (this.clickMesh) {
      if (this.clickMesh.parent) {
        this.clickMesh.parent.remove(this.clickMesh);
      }
      if (this.clickMesh.geometry) {
        this.clickMesh.geometry.dispose();
      }
      if (this.clickMesh.material instanceof THREE.Material) {
        this.clickMesh.material.dispose();
      }
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