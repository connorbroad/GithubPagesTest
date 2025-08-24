import { MyMath, Vector2 } from "../utils/utils";

// TODO: refactor, kinda ugly. Separate the head handling from body handling.
export class SnakeSegment {
    private isControllable = false; // only the head of the snake should be controllable.
    private _attachedTo: SnakeSegment | null;
    public get attachedTo(): SnakeSegment | null { return this._attachedTo; };

    // the cell the segment is in / moving into
    private _cell = Vector2.zero;
    public get cell() { return this._cell.copy; };
    private _lastCell = Vector2.zero;
    public get lastCell() { return this._lastCell.copy; };

    // the smoothed position during animation
    private _drawnPos = Vector2.zero;
    public get drawnPos() { return new Vector2(this._drawnPos.x, this._drawnPos.y); };

    constructor(attachedSegment: SnakeSegment | null, isControllable: boolean = false) {
        this._attachedTo = attachedSegment;
        this.isControllable = isControllable;

        this._cell.set(this.attachedTo?.cell ?? this._cell);
        this._drawnPos.set(this.attachedTo?.drawnPos ?? this.cell);
        this._lastCell.set(this._cell);
    }

    // intended for controllable segments (the head) only
    public moveToCell(cell: Vector2, instant: boolean = false) {
        if (!this.isControllable) return;
        this._lastCell.set(this._cell);
        this._cell.set(cell);

        if (instant) {
            this._drawnPos.set(this._cell);
            this._lastCell.set(this._cell);
        }
    }

    // intended to be applied from tail -> head
    public followSnake() {
        this._lastCell.set(this._cell);

        if (!this.attachedTo) return;
        this._cell.set(this.attachedTo.cell);
    }

    public moveDrawPosTowardsCell(timeDelta: number) {
        if (isNaN(timeDelta)) timeDelta = 0;
        this._drawnPos.x = MyMath.lerp(this._drawnPos.x, this.cell.x, Math.min(timeDelta, 1));
        this._drawnPos.y = MyMath.lerp(this._drawnPos.y, this.cell.y, Math.min(timeDelta, 1));
    }
}
