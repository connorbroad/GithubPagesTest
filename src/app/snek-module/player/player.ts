import { Food } from "../food/food-dispenser";
import { GameController } from "../game/game-controller";
import { MyMath, Vector2 } from "../utils/utils";
import { PlayerMovementProcessor } from "./player-movement";
import { SnakeSegment } from "./snake-segment";

export class Snake {
  // references  
  private drawCtx: CanvasRenderingContext2D;
  private g: GameController;
  private movementProcessor: PlayerMovementProcessor;

  // snake body
  private snakeSegments: SnakeSegment[] = [];
  private snakeHeadSegment: SnakeSegment;
  private snakeHeadWidth: number;
  private readonly movementAntiSmooth = 12;

  private isDead = false;

  //food target
  private food: Food;

  constructor(gameControl: GameController, drawCtx: CanvasRenderingContext2D,) {
    this.drawCtx = drawCtx;
    this.g = gameControl;
    this.movementProcessor = new PlayerMovementProcessor();
    this.snakeHeadWidth = this.g.board.cellWidthPx;

    this.reset();
  }

  public reset() {
    this.snakeSegments = [];
    this.snakeHeadSegment = new SnakeSegment(null, true);
    this.snakeSegments.push(this.snakeHeadSegment);

    let startingCell = this.g.board.getCenterCell();
    this.snakeHeadSegment.moveToCell(startingCell, true);
    this.g.board.snakeHeadMovedIntoCell(startingCell);
    this.movementProcessor.reset();
    this.isDead = false;

    // starting snake length
    this.grow();
    this.grow();
  }

  public onKeyDown(e: KeyboardEvent) {
    this.movementProcessor.onKeyDown(e);
  }

  public update() {
    let nextDirection = this.movementProcessor.updateDirection(); // a valid direction the player has committed to moving in
    let nextCell = this.snakeHeadSegment.cell.add(nextDirection); // the cell the player will try to move into

    if (this.cellWillKillPlayer(nextCell))
      this.die();

    this.moveIntoCell(nextCell);

    if (this.food.cell.equals(this.snakeHeadSegment.cell))
      this.eat();
  }

  private cellWillKillPlayer(cell: Vector2): boolean {
    let cellCollidesWithBody = this.cellIsInsidePlayerBody(cell);
    let cellIsOffBoard = !this.g.board.cellIsOnBoard(cell);
    return cellIsOffBoard || cellCollidesWithBody;
  }

  private tail(): SnakeSegment {
    return this.snakeSegments[this.snakeSegments.length - 1];
  }

  // ignores the tail
  private cellIsInsidePlayerBody(tgtCell: Vector2): boolean {
    for (let i = 0; i < this.snakeSegments.length - 1; i++) {
      if (this.snakeSegments[i].cell.equals(tgtCell))
        return true;
    }
    return false;
  }

  private moveIntoCell(cell: Vector2) {
    let snakeTailCellBeforeMove = this.tail().cell;

    // move body into itself
    [...this.snakeSegments].reverse().forEach(segment => {
      segment.followSnake();
    });

    // move head into cell 
    this.snakeHeadSegment.moveToCell(cell);

    //update the board's occupied cells list
    let snakeTailCellAfterMove = this.tail().cell;
    if (!snakeTailCellBeforeMove.equals(snakeTailCellAfterMove))
      this.g.board.snakeTailLeftCell(snakeTailCellBeforeMove);
    this.g.board.snakeHeadMovedIntoCell(cell);
  }

  private die() {
    this.isDead = true;
    this.g.onPlayerDied();
  }

  private eat() {
    this.food.getEaten();
    this.grow();

    this.g.onPreyEaten();
  }

  public setPrey(food: Food) {
    this.food = food;
  }

  private grow() {
    let newSegment = new SnakeSegment(this.tail());
    this.snakeSegments.push(newSegment);
  }

  public draw(timeDelta: number) {
    let useSmoothMovement = true;

    // update the snake's smoothed position
    this.snakeSegments.forEach((segment, i) => {
      let smoothSpeed = timeDelta * this.movementAntiSmooth;
      segment.moveDrawPosTowardsCell(smoothSpeed);
    });

    // line down the snake   
    this.drawCtx.lineWidth = this.snakeHeadWidth * 0.7;
    this.drawCtx.strokeStyle = `rgb(0,100,100)`;
    this.drawCtx.lineJoin = 'round';
    this.drawCtx.lineCap = 'round';

    // draw lines from each segment to it's target segment
    this.drawCtx.beginPath();
    let tailDrawnPos = this.g.board.getBoardPos(this.tail().drawnPos);
    this.drawCtx.moveTo(tailDrawnPos.x, tailDrawnPos.y);
    for (let i = this.snakeSegments.length - 1; i >= 0; --i) {
      let segment = this.snakeSegments[i];

      if (useSmoothMovement) {
        // draw a line to the segment's target cell, then to the next segment's drawn position.
        if (i == 0) {
          let drawnPos = this.g.board.getBoardPos(segment.drawnPos);
          this.drawCtx.lineTo(drawnPos.x, drawnPos.y);
        }
        else {
          let cell = this.g.board.getBoardPos(segment.cell);
          this.drawCtx.lineTo(cell.x, cell.y);
        }
      }
      else {
        // wonky movement - just draw lines between the drawn positions
        let drawnPos = this.g.board.getBoardPos(segment.drawnPos);
        this.drawCtx.lineTo(drawnPos.x, drawnPos.y);
      }
    };
    this.drawCtx.stroke();

    // box segments - draw backwards so the head is drawn on top of the tail / body
    let headLightRGB = !this.isDead ? { r: 50, g: 175, b: 115 } : { r: 200, g: 50, b: 50 };
    let headDarkRGB = !this.isDead ? { r: 20, g: 120, b: 120 } : { r: 50, g: 50, b: 50 };
    for (let i = this.snakeSegments.length - 1; i >= 0; i--) {
      let segment = this.snakeSegments[i];
      let colorPerc = Math.max(0, 1 - i / 5);
      this.drawCtx.fillStyle = `rgb(${MyMath.lerp(headDarkRGB.r, headLightRGB.r, colorPerc)}, ${MyMath.lerp(headDarkRGB.g, headLightRGB.g, colorPerc)}, ${MyMath.lerp(headDarkRGB.b, headLightRGB.b, colorPerc)})`;

      //scale
      let bodySizeMin = this.snakeHeadWidth * 0.3;
      let bodySizeDiminishment = (i / 12);

      let width = this.snakeHeadWidth * (1 - bodySizeDiminishment);
      width = Math.max(bodySizeMin, width);

      //position
      let x = this.g.board.getBoardPosI(segment.drawnPos.x) - width / 2;
      let y = this.g.board.getBoardPosI(segment.drawnPos.y) - width / 2;

      // rotation + position
      let halfWidth = width / 2;
      this.drawCtx.save();
      this.drawCtx.translate(x + halfWidth, y + halfWidth);
      this.drawCtx.rotate((45) * Math.PI / 180);
      this.drawCtx.fillRect(-halfWidth, -halfWidth, width, width);
      this.drawCtx.restore();
    };
  }
}

