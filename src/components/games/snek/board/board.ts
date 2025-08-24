import {Vector2} from "../utils/utils";
import * as THREE from "three";
import {GameLayer, GameLayerPos, ZDepthHelper} from "../../_utils/game-utils.ts";

export class Board {
    private readonly numCellsWide: number;
    private readonly numCellsHigh: number;
    private freeCells: Vector2[] = [];
    private cellMeshes: THREE.Mesh[][] = [];

    private boardTime: number = 0;
    private readonly updateFreqMs = 0.2; // e.g. for low framerate background
    private lastUpdateTime = 0;

    readonly swayAmplitude = 0.2;
    readonly swayFrequency = 0.5;
    readonly swayWaveLength = 30;

    constructor(numCellsWide: number, numCellsHigh: number) {
        this.numCellsWide = numCellsWide;
        this.numCellsHigh = numCellsHigh;
        this.reset();
    }

    public cellWidthPc(): number {
        return 1 / this.numCellsWide;
    }

    public cellHeightPc(): number {
        return 1 / this.numCellsHigh;
    }

    public init(scene: THREE.Scene, gameWidth: number, gameHeight: number) {
        const distBetweenCubes = 0.015;
        let cubeWidth = gameWidth / this.numCellsWide - distBetweenCubes;
        let cubeHeight = gameHeight / this.numCellsHigh - distBetweenCubes;
        for (let j = 0; j < this.numCellsHigh; j++) {
            this.cellMeshes[j] = [];
            for (let i = 0; i < this.numCellsWide; i++) {
                const geometry = new THREE.PlaneGeometry(cubeWidth, cubeHeight);
                let cellShade01 = this.getShade01ForCell(i, j);
                let cellShade = this.getShadeForCell(cellShade01);
                const material = new THREE.MeshBasicMaterial({ color: new THREE.Color('rgb(' + cellShade + ',' + cellShade + ',' + cellShade + ')') });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.x = i * cubeWidth + (cubeWidth / 2) + (distBetweenCubes * i) + distBetweenCubes / 2;
                cube.position.y = j * cubeHeight + (cubeHeight / 2) + (distBetweenCubes * j) + distBetweenCubes / 2;
                cube.position.z = ZDepthHelper.getMeshZDepth(GameLayer.Background, GameLayerPos.Bottom);
                cube.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.1);
                this.cellMeshes[j][i] = cube;
                scene.add(cube);
            }
        }
    }

    public update(timeDelta: number) {
        if (isNaN(this.boardTime) || isNaN(timeDelta)) return;

        this.boardTime += timeDelta;
        if (this.boardTime - this.lastUpdateTime < this.updateFreqMs) return;
        this.lastUpdateTime = this.boardTime;

        // sway the cells with the wind
        for (let j = 0; j < this.numCellsHigh; j++) {
            for (let i = 0; i < this.numCellsWide; i++) {
                this.cellMeshes[j][i].rotation.z = Math.sin(this.boardTime * this.swayFrequency + (i * (i + j)) / this.swayWaveLength) * this.swayAmplitude;
            }
        }
    }

    public reset() {
        this.constructFreeCellsArray();
    }

    public getBoardPcPos(cell: Vector2): Vector2 {
        return new Vector2(
            this.getBoardPcPosX(cell.x),
            this.getBoardPcPosY(cell.y)
        );
    }

    public getBoardPcPosX(cellX: number) {
        return cellX / this.numCellsWide + this.cellWidthPc() / 2;
    }

    public getBoardPcPosY(cellY: number) {
        return cellY / this.numCellsHigh + this.cellHeightPc() / 2;
    }

    public getCenterCell(): Vector2 {
        const x = Math.floor(this.numCellsWide / 2);
        const y = Math.floor(this.numCellsHigh / 2);
        return new Vector2(x, y);
    }

    public cellIsOnBoard(cell: Vector2) {
        cell.toVector2Int();
        return (
            cell.x >= 0 &&
            cell.x < this.numCellsWide &&
            cell.y >= 0 &&
            cell.y < this.numCellsHigh
        );
    }

    // maintains the list of free cells that the prey can spawn in
    public snakeHeadMovedIntoCell(cell: Vector2) {
        this.freeCells = this.freeCells.filter(
            (freeCell) => !freeCell.equals(cell)
        );
    }

    public snakeTailLeftCell(oldCell: Vector2) {
        this.freeCells.push(oldCell);
    }

    public getUnoccupiedCells(): Vector2[] {
        return [...this.freeCells];
    }

    private getShade01ForCell(i: number, j: number): number {
        i += 1;
        j += 1;
        let patternOffset = 23;
        let shade01 = (i * j + j) / 100 * patternOffset % 1;
        return shade01;
    }

    private getShadeForCell(perc: number): number {
        let min = 150;
        let max = 220;
        return Math.floor(min + (max - min) * perc);
    }

    private constructFreeCellsArray() {
        this.freeCells = [];
        for (let y = 0; y < this.numCellsHigh; y++) {
            for (let x = 0; x < this.numCellsWide; x++) {
                this.freeCells.push(new Vector2(x, y));
            }
        }
    }
}
