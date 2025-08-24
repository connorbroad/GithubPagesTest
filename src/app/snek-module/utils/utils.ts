export class MyMath {
    public static lerp(start: number, end: number, perc: number) {
        return start * (1 - perc) + end * perc;
    }
}

export class Vector2 {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    round(): Vector2 {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    set(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
    }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    equals(v: Vector2) {
        let v1 = this.round();
        let v2 = v.round();
        return v1.x == v2.x && v1.y == v2.y;
    }

    get copy() {
        return new Vector2(this.x, this.y);
    }

    static get up(): Vector2 {
        return new Vector2(0, -1);
    }
    static get down(): Vector2 {
        return new Vector2(0, 1);
    }
    static get left(): Vector2 {
        return new Vector2(-1, 0);
    }
    static get right(): Vector2 {
        return new Vector2(1, 0);
    }
    static get zero(): Vector2 {
        return new Vector2(0, 0);
    }
}