import * as THREE from 'three';

export interface BiimoGame {
    init(scene: THREE.Scene, gameWidth: number, gameHeight: number): void;

    update(timeDeltaS: number): void;
}