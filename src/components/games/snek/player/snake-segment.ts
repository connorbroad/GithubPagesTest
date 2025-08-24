import {MyUtils, Vector2} from "../utils/utils";
import * as THREE from "three";
import type {Board} from "../board/board.ts";

// Consider refactoring to have a ControllableSnakeSegment class that extends SnakeSegment
export class SnakeSegment {
    private readonly isControllable: boolean = false; // only the head of the snake should be controllable.
    private readonly _attachedTo: SnakeSegment | null;
    private detailMeshGroup: THREE.Group | null = null;
    private bodyMesh: THREE.Mesh | null = null;
    // the previous cell the segment was in before moving
    private _lastCell = Vector2.zero;

    constructor(
        attachedSegment: SnakeSegment | null,
        private board: Board,
        isControllable: boolean = false
    ) {
        this._attachedTo = attachedSegment;
        this.isControllable = isControllable;

        this._cell.set(this.attachedTo?.cell ?? this._cell);
        if (this.attachedTo)
            this._drawnPos = this.attachedTo?.drawnPos;
        else
            this._drawnPos.set(this.getDrawnPos(this._cell));

        this._lastCell.set(this._cell);
    }

    public get hasDetailMesh(): boolean {
        return this.detailMeshGroup !== null;
    }

    public get hasBodyMesh(): boolean {
        return this.bodyMesh !== null;
    }

    public disposeMesh(scene: THREE.Scene) {
        for (let child of this.detailMeshGroup?.children ?? []) {
            if (child instanceof THREE.Mesh) {
                MyUtils.removeMeshFromScene(child, scene);
            }
        }
        scene.remove(this.detailMeshGroup);
         
        if(this.bodyMesh)
            MyUtils.removeMeshFromScene(this.bodyMesh, scene);
        
        this.detailMeshGroup = null;
        this.bodyMesh = null;
    }

    public get attachedTo(): SnakeSegment | null {
        return this._attachedTo;
    }

    // the cell the segment is in / moving into
    private _cell = Vector2.zero;

    public get cell() {
        return this._cell.copy;
    }

    // the smoothed position during animation
    private _drawnPos = Vector2.zero;

    public get drawnPos() {
        return this._drawnPos.copy;
    }

    // The head or segments of the snake
    public setDetailMesh(detailGroup: THREE.Group) {
        this.detailMeshGroup = detailGroup;
    }

    // The body of the snake. A chain of 2d capsules.
    public setBodyMesh(bodyMesh: THREE.Mesh, zDepthBody: number) {
        this.bodyMesh = bodyMesh;
        if(this.bodyMesh)
            this.bodyMesh.position.z = zDepthBody;
    }

    // intended for controllable segments (the head) only
    public moveToCell(cell: Vector2, instant: boolean = false) {
        if (!this.isControllable) return;
        this._lastCell.set(this._cell);
        this._cell.set(cell);

        if (instant) {
            this._drawnPos.set(this.getDrawnPos(cell));
            this._lastCell.set(this._cell);
        }
    }

    // intended to be applied from tail -> head
    public followSnake() {
        this._lastCell.set(this._cell);

        if (!this.attachedTo) return;
        this._cell.set(this.attachedTo.cell);
    }

    public updateMesh(timeDelta: number) {
        this.moveDrawPosTowardsCell(timeDelta);

        if (this.detailMeshGroup) {
            this.detailMeshGroup.position.x = this._drawnPos.x;
            this.detailMeshGroup.position.y = this._drawnPos.y;
        }
        if (this.bodyMesh) {
            this.bodyMesh.position.x = this._drawnPos.x;
            this.bodyMesh.position.y = this._drawnPos.y;

            if (this.attachedTo) {
                // rotate to the next segment
                let tgtCellDrawnPos = this.attachedTo;
                let diff = tgtCellDrawnPos.drawnPos.sub(this.drawnPos);
                this.bodyMesh.rotation.z = Math.atan2(diff.y, diff.x);

                // set length to reach the next segment
                const bodyMeshBaseLength = this.board.cellWidthPc(); // Set on geometry creation. Not sure if we can retrieve it here.
                let distToNextDrawnPos = diff.x * diff.x + diff.y * diff.y;
                this.bodyMesh.scale.x = distToNextDrawnPos / this.board.cellWidthPc() / bodyMeshBaseLength;
            }
        }
    }

    private moveDrawPosTowardsCell(timeDelta: number) {
        if (isNaN(timeDelta)) timeDelta = 0;

        let tgtCellDrawnPos = this.getDrawnPos(this._cell);
        this._drawnPos.x = MyUtils.lerp(
            this._drawnPos.x,
            tgtCellDrawnPos.x,
            timeDelta,
        );
        this._drawnPos.y = MyUtils.lerp(
            this._drawnPos.y,
            tgtCellDrawnPos.y,
            timeDelta,
        );
    }

    private getDrawnPos(cell: Vector2): Vector2 {
        return this.board.getBoardPcPos(cell);
    }
}
