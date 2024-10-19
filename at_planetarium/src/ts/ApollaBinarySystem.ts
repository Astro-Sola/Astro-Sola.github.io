import * as THREE from 'three';
import { CelestialBody, CelestialBodyData } from './CelestialBody';
import { StarBody } from './StarBody';

export class ApollaBinarySystem {
  private scene: THREE.Scene;
  private bodies: CelestialBody[] = [];
  private currentTime: number = 0;
  private timeScale: number = 1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loadCelestialData();
  }

  private async loadCelestialData(): Promise<void> {
    try {
      const response = await fetch('/data/celestial-data.json');
      const data = await response.json() as CelestialBodyData[];
      console.log('Loaded celestial data:', data);
      this.createBodies(data);
    } catch (error) {
      console.error('Error loading celestial data:', error);
    }
  }

  private createBodies(data: CelestialBodyData[]): void {
    console.log('Creating bodies, count:', data.length);
    data.forEach((bodyData) => {
      try {
        let body: CelestialBody;
        if (bodyData.type === 'star') {
          body = new StarBody(bodyData, this.scene);
        } else {
          body = new CelestialBody(bodyData, this.scene);
        }
        this.bodies.push(body);
        
        const orbit = body.getOrbit();
        if (orbit) {
          this.scene.add(orbit);
          console.log(`Added orbit for ${bodyData.name}`);
        }

        const mesh = body.getMesh();
        this.scene.add(mesh);
        console.log(`Added mesh for ${bodyData.name}`);

      } catch (error) {
        console.error(`Error creating body ${bodyData.name}:`, error);
      }
    });

    console.log('All bodies created and added to the scene');
  }

  public update(deltaTime: number, camera: THREE.Camera): void {
    this.currentTime += deltaTime * this.timeScale;
    this.bodies.forEach(body => {
      body.update(this.currentTime, camera);
    });
  }

  public setOrbitVisibility(visible: boolean): void {
    this.bodies.forEach(body => body.setOrbitVisibility(visible));
  }

  public setTrailVisibility(visible: boolean): void {
    this.bodies.forEach(body => body.setTrailVisibility(visible));
  }

  public setTrailLength(length: number): void {
    this.bodies.forEach(body => body.setTrailLength(length));
  }

  public setTimeScale(scale: number): void {
    this.timeScale = scale;
  }

  public getCelestialBodies(): CelestialBody[] {
    return this.bodies;
  }

  public getCelestialBodyByName(name: string): CelestialBody | undefined {
    return this.bodies.find(body => body.getName() === name);
  }

  public dispose(): void {
    // すべての天体のリソースを解放
    this.bodies.forEach(body => body.dispose());
    this.bodies = [];
  }

}