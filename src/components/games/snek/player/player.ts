import {Prey} from "../prey/prey-controller";
import {SnakeGame} from "../game/snake-game.ts";
import {Vector2, Vector4} from "../utils/utils";
import {PlayerMovementProcessor} from "./player-movement";
import {SnakeSegment} from "./snake-segment";
import * as THREE from "three";
import {GameLayer, GameLayerPos, ZDepthHelper} from "../../_utils/game-utils.ts";

export class Snake {
    // references
    private g: SnakeGame;
    private readonly scene: THREE.Scene;
    private movementProcessor: PlayerMovementProcessor;

    // snake body
    private snakeSegments: SnakeSegment[] = [];
    private snakeHeadSegment: SnakeSegment | undefined;
    private readonly movementAntiSmooth = 12; // lower = smoother
    private readonly snakeStartingLength = 2;

    private snakeBodyColor = Vector4.FromHexColor(`#1e1e1e`);
    private snakeDetailColorStart = Vector4.FromHexColor(`#ffffff`);
    private snakeDetailColorEnd = Vector4.FromHexColor(`#6e6e6e`);
    private deadSnakeDetailColorStart = Vector4.FromHexColor(`#c63232`);
    private deadSnakeDetailColorEnd = Vector4.FromHexColor(`#323232`);

    private isDead = false;

    //prey target
    private prey: Prey | undefined;

    constructor(gameControl: SnakeGame, scene: THREE.Scene) {
        this.g = gameControl;
        this.scene = scene;
        this.movementProcessor = new PlayerMovementProcessor();

        this.reset();
    }

    public reset() {
        for (let segment of this.snakeSegments) {
            segment.disposeMesh(this.scene);
        }

        this.snakeSegments = [];
        this.snakeHeadSegment = this.grow();

        const startingCell = this.g.board?.getCenterCell() ?? Vector2.zero;
        this.snakeHeadSegment.moveToCell(startingCell, true);
        this.g.board?.snakeHeadMovedIntoCell(startingCell);
        this.movementProcessor.reset();
        this.isDead = false;

        for (let i = 0; i < this.snakeStartingLength; i++) {
            this.grow();
        }
    }

    public onKeyDown(e: KeyboardEvent) {
        this.movementProcessor.onKeyDown(e);
    }

    public update() {
        const nextDirection = this.movementProcessor.updateDirection(); // a valid direction the player has committed to moving in
        const nextCell = this.snakeHeadSegment!.cell.add(nextDirection); // the cell the player will try to move into

        if (this.cellWillKillPlayer(nextCell)) {
            this.die();
        }

        this.moveIntoCell(nextCell);

        if (this.prey!.cell.equals(this.snakeHeadSegment!.cell)) {
            this.eat();
        }
    }

    public setPrey(prey: Prey) {
        this.prey = prey;
    }

    public updateThreeJs(timeDelta: number) {
        this.updateSnakePosition(timeDelta);
    }

    private updateSnakePosition(timeDelta: number) {
        this.snakeSegments.forEach((segment) => {
            const smoothSpeed = timeDelta * this.movementAntiSmooth;
            segment.updateMesh(smoothSpeed);
        });
    }

    private cellWillKillPlayer(cell: Vector2): boolean {
        const cellCollidesWithBody = this.cellIsInsidePlayerBody(cell);
        const cellIsOffBoard = !this.g.board!.cellIsOnBoard(cell);
        return cellIsOffBoard || cellCollidesWithBody;
    }

    private tail(): SnakeSegment {
        return this.snakeSegments[this.snakeSegments.length - 1];
    }

    // ignores the tail
    private cellIsInsidePlayerBody(tgtCell: Vector2): boolean {
        for (let i = 0; i < this.snakeSegments.length - 1; i++) {
            if (this.snakeSegments[i].cell.equals(tgtCell)) {
                return true;
            }
        }
        return false;
    }

    private moveIntoCell(cell: Vector2) {
        const snakeTailCellBeforeMove = this.tail().cell;

        // move body into itself
        [...this.snakeSegments].reverse().forEach((segment) => {
            segment.followSnake();
        });

        // move head into cell
        this.snakeHeadSegment!.moveToCell(cell);

        // update the board's occupied cells list
        const snakeTailCellAfterMove = this.tail().cell;
        if (!snakeTailCellBeforeMove.equals(snakeTailCellAfterMove)){
            this.g.board!.snakeTailLeftCell(snakeTailCellBeforeMove);
        }

        this.g.board!.snakeHeadMovedIntoCell(cell);
    }

    private die() {
        this.isDead = true;
        this.g.onPlayerDied();
    }

    private eat() {
        this.prey!.getEaten();
        this.grow();
        this.g.onPreyEaten();
    }

    private grow(): SnakeSegment {
        let isControllable = this.snakeSegments.length == 0;
        const newSegment = new SnakeSegment(this.tail(), this.g.board, isControllable);
        this.snakeSegments.push(newSegment);
        this.addDetailMesh(newSegment, this.snakeSegments.length - 1);
        if (this.snakeSegments.length > 1) // don't add a body mesh to the head
            this.addBodyMesh(this.tail(), this.snakeSegments.length - 1);
        return newSegment;
    }

    private addDetailMesh(segment: SnakeSegment, segmentIndex: number) {
        if (segment.hasDetailMesh) return;

        // color - lerp based on the segment's position in the snake
        const colorPerc = Math.max(0, 1 - segmentIndex / 5);
        const snakeHeadColor = Vector4.Lerp(
            this.snakeDetailColorEnd,
            this.snakeDetailColorStart,
            colorPerc
        );

        // scale
        let snakeHeadWidth = 0.8 * this.g.board?.cellWidthPc();
        let bodySizeMin = snakeHeadWidth * 0.3;
        let bodySizeDiminishment = segmentIndex / 12;
        let headWidth = snakeHeadWidth * (1 - bodySizeDiminishment);
        headWidth = Math.max(bodySizeMin, headWidth); // clamp the min size

        // create mesh outline
        const geometry = new THREE.CircleGeometry(headWidth, 4); // circle with 4 sides = square
        const outlineMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(0.1, 0.1, 0.1)});
        const bgSquare = new THREE.Mesh(geometry, outlineMaterial);

        // colored mesh
        const headSize = headWidth * 0.7;
        const geometry2 = new THREE.CircleGeometry(headSize, 4); // circle with 4 sides = square
        const bodyMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(snakeHeadColor.x, snakeHeadColor.y, snakeHeadColor.z)});
        const bodySquare = new THREE.Mesh(geometry2, bodyMaterial);
        
        let group = new THREE.Group();
        group.add(bgSquare);
        group.add(bodySquare);
        let zPerc = 1 - 0.001 * segmentIndex;
        group.position.z = ZDepthHelper.getMeshZDepth(GameLayer.Game, zPerc);
        this.scene.add(group);

        segment.setDetailMesh(group);
    }

    private addBodyMesh(segment: SnakeSegment, segmentIndex: number) {
        if (segment.hasBodyMesh) return;

        let width = this.g.board?.cellWidthPc() * 0.75;
        let length = this.g.board?.cellWidthPc();

        // create mesh
        const material = new THREE.MeshBasicMaterial({color: new THREE.Color(this.snakeBodyColor.x, this.snakeBodyColor.y, this.snakeBodyColor.z)});
        const geometry = new THREE.CapsuleGeometry(width / 2, length, 1, 4);
        geometry.rotateZ(-Math.PI / 2);
        geometry.translate(length / 2, 0, 0); // so one end is at the origin

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = ZDepthHelper.getMeshZDepth(GameLayer.Game, GameLayerPos.Top);
        this.scene.add(mesh);
        segment.setBodyMesh(mesh, ZDepthHelper.getMeshZDepth(GameLayer.Game, GameLayerPos.Bottom));
    }
}
