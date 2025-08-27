import * as THREE from 'three';
import {TextUtils} from "../../_utils/text-utils.ts";
import {GameLayer, ZDepthHelper} from "../../_utils/game-utils.ts";
import {GameState} from "../utils/utils.ts";

export class UiController {
    private readonly gameReadyUI: THREE.Group | undefined;
    private readonly gameOverUI: THREE.Group | undefined;
    private readonly victoryUI: THREE.Group | undefined;

    // map of game states to UI elements
    private readonly gameStateToUI: Map<GameState, THREE.Group | undefined> = new Map();

    constructor(scene: THREE.Scene) {
        let textWidth = 0.9; // width of the text in percentage of the screen
        this.gameReadyUI = new THREE.Group();
        this.gameReadyUI.add(TextUtils.addText(scene, "Snake", 0.5, 0.65, textWidth, true));
        this.gameReadyUI.add(TextUtils.addText(scene, "Press any arrow key\nto start", 0.5, 0.2, textWidth, true));
        this.gameReadyUI.position.z = ZDepthHelper.getMeshZDepth(GameLayer.UI, 0.9);
        scene.add(this.gameReadyUI);

        this.gameOverUI = new THREE.Group();
        this.gameOverUI.add(TextUtils.addText(scene, "Game Over", 0.5, 0.65, textWidth, true));
        this.gameOverUI.add(TextUtils.addText(scene, "Press spacebar\nto restart", 0.5, 0.2, textWidth, true));
        this.gameOverUI.position.z = ZDepthHelper.getMeshZDepth(GameLayer.UI, 0.9);
        scene.add(this.gameOverUI);

        this.victoryUI = new THREE.Group();
        this.victoryUI.add(TextUtils.addText(scene, "Victory!", 0.5, 0.65, textWidth, true));
        this.victoryUI.add(TextUtils.addText(scene, "Press spacebar\nto restart", 0.5, 0.2, textWidth, true));
        this.victoryUI.position.z = ZDepthHelper.getMeshZDepth(GameLayer.UI, 0.9);
        scene.add(this.victoryUI);

        // map game states to UI elements
        this.gameStateToUI.set(GameState.MainMenu, this.gameReadyUI);
        this.gameStateToUI.set(GameState.GameOver, this.gameOverUI);
        this.gameStateToUI.set(GameState.Playing, undefined);
        this.gameStateToUI.set(GameState.Victorious, this.victoryUI);
    }

    public showUI(state: GameState){
        // hide all UI elements
        this.gameStateToUI.forEach((ui, _) => {
            if (ui) {
                ui.visible = false;
            }
        });

        // show the UI element for the current state
        const ui = this.gameStateToUI.get(state);
        if (ui) {
            ui.visible = true;
        }
    }
}