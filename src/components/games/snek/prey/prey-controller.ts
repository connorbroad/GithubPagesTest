import {SnakeGame} from "../game/snake-game.ts";
import {MyUtils, Vector2, Vector4} from "../utils/utils";
import * as THREE from "three";
import type {Board} from "../board/board.ts";
import {GameLayer, GameLayerPos, ZDepthHelper} from "../../_utils/game-utils.ts";

export class PreyController {
    private preyOnTheBoard: Prey[] = [];

    constructor(private gameControl: SnakeGame, private scene: THREE.Scene) {
    }

    public update() {
        this.removeEatenPrey();

        for (const prey of this.preyOnTheBoard) {
            prey.update();
        }
    }

    private removeEatenPrey() {
        const despawnedPrey: Prey[] = [];
        for (const prey of this.preyOnTheBoard) {
            if (prey.wasEaten && prey.getScalePerc() == 0) {
                prey.disposeMesh(this.scene);
                despawnedPrey.push(prey);
            }
        }
        this.preyOnTheBoard = this.preyOnTheBoard.filter(
            (c) => despawnedPrey.indexOf(c) < 0,
        );
    }

    public spawnNewPrey(): Prey {
        const cell = this.getFreeBoardCell();
        const prey = new Prey(cell, this.gameControl.board, this.scene);
        this.preyOnTheBoard.push(prey);
        return prey;
    }

    public reset() {
        for(let prey of this.preyOnTheBoard) {
            prey.disposeMesh(this.scene);
        }
        this.preyOnTheBoard = [];
    }

    private getFreeBoardCell(): Vector2 {
        const freeCells = this.gameControl.board?.getUnoccupiedCells() ?? [];
        return freeCells[Math.floor(freeCells.length * Math.random())];
    }
}

export class Prey {
    public cell: Vector2;
    public timeCreated: number;
    public timeEaten: number = 0;
    private mesh: THREE.Mesh | null = null;

    private spawnSpeedMS = 400;
    private spinSpeed = 0.003;
    private bounceSpeed = 0.005;
    private minWidthPc = 0.3;
    private minHeightPc = 0.3;
    private maxWidthPc = 0.5;
    private maxHeightPc = 0.5;
    private color: Vector4 = Vector4.FromHexColor("#01161a");

    private zDepth = ZDepthHelper.getMeshZDepth(GameLayer.Game, GameLayerPos.Bottom);

    public get hasMesh(): boolean {
        return this.mesh !== null;
    }

    constructor(cell: Vector2, private board: Board, scene: THREE.Scene) {
        this.cell = cell;
        this.timeCreated = Date.now();
        this.createAndAddMesh(scene);
    }

    public update() {
        if(!this.hasMesh) return;

        const animPerc = Math.sin(this.timeAlive() * this.bounceSpeed) / 2 + 0.5;
        let spawnModifier = this.getScalePerc();

        // update size
        const maxWidth = this.maxWidthPc;
        const minWidth = this.minWidthPc;
        const maxHeight = this.maxHeightPc;
        const minHeight = this.minHeightPc;
        const width = MyUtils.lerp(minWidth, maxWidth, animPerc) * spawnModifier;
        const height = MyUtils.lerp(minHeight, maxHeight, animPerc) * spawnModifier;
        this.mesh.scale.set(width, height, 1);

        const x = this.board.getBoardPcPosX(this.cell.x);
        const y = this.board.getBoardPcPosY(this.cell.y);
        const rot = this.timeAlive() * this.spinSpeed;
        this.mesh.position.set(x, y, this.zDepth);
        this.mesh.rotation.z = rot;
    }

    private createAndAddMesh(scene: THREE.Scene) {
        if(this.hasMesh) return;

        // scale
        let headWidth = this.board.cellWidthPc();

        // create mesh
        const geometry = new THREE.PlaneGeometry(headWidth, headWidth, 4);
        const material = new THREE.MeshBasicMaterial({color: new THREE.Color(this.color.x, this.color.y, this.color.z)});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = 2;

        const x = this.board.getBoardPcPosX(this.cell.x);
        const y = this.board.getBoardPcPosY(this.cell.y);
        mesh.position.set(x, y, this.zDepth);

        scene.add(mesh);
        this.mesh = mesh;
    }

    private _wasEaten = false;

    public get wasEaten() {
        return this._wasEaten;
    }

    public timeAlive(): number {
        return Date.now() - this.timeCreated;
    }

    public timeSinceEaten(): number {
        return Date.now() - this.timeEaten;
    }

    public getEaten() {
        this._wasEaten = true;
        this.timeEaten = Date.now();
    }

    // modifies the normal scale to account for the spawn and despawn animations
    public getScalePerc() {
        const spawnScale01 = Math.min(1.0, this.timeAlive() / this.spawnSpeedMS);
        let despawnScale01 = 1;

        if (this._wasEaten)
            despawnScale01 =
                1 - Math.min(1.0, Math.max(0, this.timeSinceEaten() / this.spawnSpeedMS));

        return spawnScale01 * despawnScale01;
    }

    public disposeMesh(scene: THREE.Scene) {
        MyUtils.removeMeshFromScene(this.mesh, scene);
        this.mesh = null;
    }
}
