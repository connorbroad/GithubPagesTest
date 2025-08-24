import { Vector2 } from "../utils/utils";

export class Board {
  private drawCtx: CanvasRenderingContext2D;
  private boardWidthPx: number; // is also board height
  private numCellsWide: number;
  private tileColor = '#b8d2cd';
  private tileShadowColor = '#acccc6';
  private tileShadowVisiblePx = 3;
  private _cellWidthPx: number;
  public get cellWidthPx(): number { return this._cellWidthPx; }
  private freeCells: Vector2[] = [];
  private debugFreeCells: boolean = false;

  constructor(drawingCtx: CanvasRenderingContext2D, numCellsWide: number, width: number) {
    this.drawCtx = drawingCtx;
    this.numCellsWide = numCellsWide;
    this.boardWidthPx = width;
    this._cellWidthPx = this.boardWidthPx / numCellsWide;
    this.reset();
  }

  public draw(timeDelta: number) {
    for (let i = 0; i < this.numCellsWide; i++) {
      for (let j = 0; j < this.numCellsWide; j++) {
        // only draw every 2nd tile
        if ((i + j) % 2 == 0) continue;
        // shadow tile
        this.drawCtx.fillStyle = this.tileShadowColor;
        this.drawCtx.fillRect(i * this.cellWidthPx, j * this.cellWidthPx, this._cellWidthPx, this._cellWidthPx);
        // actual tile
        this.drawCtx.fillStyle = this.tileColor;
        this.drawCtx.fillRect(i * this.cellWidthPx, j * this.cellWidthPx, this._cellWidthPx - this.tileShadowVisiblePx, this._cellWidthPx - this.tileShadowVisiblePx);
      }
    }

    if (this.debugFreeCells) {
      let freeCells = this.getUnoccupiedCells();
      for (let i = 0; i < freeCells.length; i++) {
        this.drawCtx.fillStyle = 'rgba(0,25,255, 0.2)';
        this.drawCtx.fillRect(this.freeCells[i].x * this.cellWidthPx, this.freeCells[i].y * this.cellWidthPx, this._cellWidthPx - this.tileShadowVisiblePx, this._cellWidthPx - this.tileShadowVisiblePx);
      }
    }
  }

  public reset() {
    this.constructFreeCellsArray();
  }

  public getBoardPosI(cell: number) {
    return cell * this.cellWidthPx + this.cellWidthPx / 2;
  }
  public getBoardPos(cell: Vector2) {
    return new Vector2(this.getBoardPosI(cell.x), this.getBoardPosI(cell.y));
  }

  public getCenterCell(): Vector2 {
    let x = Math.floor(this.numCellsWide / 2);
    return new Vector2(x, x);
  }

  public cellIsOnBoard(cell: Vector2) {
    cell.round();
    return cell.x >= 0 && cell.x < this.numCellsWide
      && cell.y >= 0 && cell.y < this.numCellsWide;
  }

  private constructFreeCellsArray() {
    this.freeCells = [];
    for (let y = 0; y < this.numCellsWide; y++) {
      for (let x = 0; x < this.numCellsWide; x++) {
        this.freeCells.push(new Vector2(x, y));
      }
    }
  }
  // maintains the list of free cells that the food can spawn in 
  public snakeHeadMovedIntoCell(cell: Vector2) {
    this.freeCells = this.freeCells.filter(fcell => !fcell.equals(cell));
  }
  public snakeTailLeftCell(oldCell: Vector2) {
    this.freeCells.push(oldCell);
  }
  public getUnoccupiedCells(): Vector2[] {
    return [...this.freeCells];
  }
}
