import { GameController } from "../game/game-controller";
import { MyMath, Vector2 } from "../utils/utils";

export class FoodDispenser {
    private foods: Food[] = [];

    private spawnSpeedMS = 400;
    private spinSpeed = 0.2;
    private bounceSpeed = 0.005;
    private minWidth = 0.4;
    private maxWidth = 0.476;
    private color = `rgb(0, 150, 180)`;

    constructor(private gameControl: GameController, private drawCtx: CanvasRenderingContext2D) { }

    public update() {
        // check for any eaten food that can be removed
        let eatenFood: Food[] = [];
        for (let food of this.foods) {
            if (food.wasEaten && food.getScalePerc() == 0) {
                eatenFood.push(food);
            }
        }
        this.foods = this.foods.filter(c => eatenFood.indexOf(c) < 0);
    }

    public spawnNewPrey(): Food {
        let cell = this.getFreeBoardCell();
        let food = new Food(cell, this.spawnSpeedMS);
        this.foods.push(food);
        return food;
    }

    private getFreeBoardCell(): Vector2 {
        let freeCells = this.gameControl.board.getUnoccupiedCells();
        let freeCell = freeCells[Math.floor(freeCells.length * Math.random())];
        return freeCell;
    }

    public reset() {
        this.foods = [];
    }

    public draw(timeDelta: number) {
        for (let food of this.foods) {
            this.drawCtx.fillStyle = this.color;

            // width
            let maxWidth = this.gameControl.board.cellWidthPx * this.maxWidth;
            let minWidth = this.gameControl.board.cellWidthPx * this.minWidth;

            // scale
            let animPerc = Math.sin(food.timeAlive() * this.bounceSpeed);
            let scalePerc = food.getScalePerc();
            let width = MyMath.lerp(minWidth, maxWidth, animPerc) * scalePerc;

            // rotation + position
            let x = this.gameControl.board.getBoardPosI(food.cell.x) - width / 2;
            let y = this.gameControl.board.getBoardPosI(food.cell.y) - width / 2;
            let halfWidth = width / 2;
            this.drawCtx.save();
            this.drawCtx.translate(x + halfWidth, y + halfWidth);
            this.drawCtx.rotate((food.timeAlive() * this.spinSpeed) * Math.PI / 180);
            this.drawCtx.fillRect(-halfWidth, -halfWidth, width, width);
            this.drawCtx.restore();
        }
    }
}

export class Food {
    private spawnSpeed: number;

    private _wasEaten = false;
    public get wasEaten() { return this._wasEaten; };
    public cell: Vector2;
    public timeCreated: number;
    public timeEaten: number;

    constructor(cell: Vector2, spawnSpeed: number) {
        this.cell = cell;
        this.timeCreated = Date.now();
        this.spawnSpeed = spawnSpeed;
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

    public getScalePerc() {
        let spawnScale01 = Math.min(1.0, this.timeAlive() / this.spawnSpeed);
        let despawnScale01 = 1;

        if (this._wasEaten)
            despawnScale01 = 1 - (Math.min(1.0, (Math.max(0, this.timeSinceEaten() / this.spawnSpeed))));

        return spawnScale01 * despawnScale01;
    }
}