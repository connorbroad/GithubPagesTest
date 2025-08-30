import * as THREE from 'three';
import type { BiimoButton } from '../_utils/game-utils';

export interface BiimoGame {
    init(scene: THREE.Scene, gameWidth: number, gameHeight: number): void;

    update(timeDeltaS: number): void;

    // handle input from clicking on the HTML Biimo buttons
    handleBiimoInput(buttonId: BiimoButton): void;
}