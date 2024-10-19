import * as THREE from 'three';
import { CelestialBody, CelestialBodyData } from './CelestialBody';

export class StarBody extends CelestialBody {
    private glowMesh: THREE.Mesh;

    constructor(data: CelestialBodyData, scene: THREE.Scene) {
        super(data, scene);
        this.glowMesh = this.createGlowEffect();
        this.mesh.add(this.glowMesh);
    }

    protected createGlowEffect(): THREE.Mesh {
        const glowGeometry = new THREE.SphereGeometry(this.data.radius * 1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                c: { value: 0.1 },
                p: { value: 1.2 },
                glowColor: { value: new THREE.Color(this.data.color) },
                viewVector: { value: new THREE.Vector3(0, 0, 220) }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
                    intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * c * intensity;
                    gl_FragColor = vec4( glow, 1.0 );
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        return new THREE.Mesh(glowGeometry, glowMaterial);
    }

    public updateGlow(cameraPosition: THREE.Vector3): void {
        if (this.glowMesh.material instanceof THREE.ShaderMaterial) {
            this.glowMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
                cameraPosition,
                this.mesh.position
            );
        }
    }

    protected createMesh(): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(this.data.radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: this.data.color,
            map: this.texture,
        });
        return new THREE.Mesh(geometry, material);
    }

    public update(time: number, camera: THREE.Camera): void {
        super.update(time, camera);
        this.updateGlow(camera.position);
    }

    public dispose(): void {
        super.dispose(); // 親クラスの dispose メソッドを呼び出す

        // グローメッシュを削除
        if (this.glowMesh.parent) {
            this.glowMesh.parent.remove(this.glowMesh);
        }
        if (this.glowMesh.geometry) {
            this.glowMesh.geometry.dispose();
        }
        if (this.glowMesh.material instanceof THREE.Material) {
            this.glowMesh.material.dispose();
        }

        console.log(`Disposed additional resources for star ${this.data.name}`);
    }
}