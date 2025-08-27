import * as THREE from "three";

export enum GameState {
  MainMenu = 0,
  Playing = 1,
  GameOver = 2,
  Victorious = 3,
}

export class MyUtils {
  public static lerp(start: number, end: number, perc: number) {
    return start * (1 - perc) + end * perc;
  }

  public static removeMeshFromScene(mesh: THREE.Mesh, scene: THREE.Scene) {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose());
      } else {
        mesh.material.dispose();
      }
      scene.remove(mesh);
  }
}

export class Vector2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static get up(): Vector2 {
    return new Vector2(0, 1);
  }

  static get down(): Vector2 {
    return new Vector2(0, -1);
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

  get copy() {
    return new Vector2(this.x, this.y);
  }

  toVector2Int(): Vector2 {
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

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  equals(other: Vector2) {
    return this.x == other.x && this.y == other.y;
  }
}

export class Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static get zero(): Vector4 {
    return new Vector4(0, 0, 0, 0);
  }

  static get one(): Vector4 {
    return new Vector4(1, 1, 1, 1);
  }

  static get up(): Vector4 {
    return new Vector4(0, -1, 0, 0);
  }

  static get down(): Vector4 {
    return new Vector4(0, 1, 0, 0);
  }

  static get left(): Vector4 {
    return new Vector4(-1, 0, 0, 0);
  }

  static get right(): Vector4 {
    return new Vector4(1, 0, 0, 0);
  }

  static get forward(): Vector4 {
    return new Vector4(0, 0, -1, 0);
  }

  static get back(): Vector4 {
    return new Vector4(0, 0, 1, 0);
  }

  static get white(): Vector4 {
    return new Vector4(1, 1, 1, 1);
  }

  static get black(): Vector4 {
    return new Vector4(0, 0, 0, 1);
  }

  get copy() {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  static FromHexColor(str: string): Vector4 {
    let r = parseInt(str.substring(1, 3), 16) / 255;
    let g = parseInt(str.substring(3, 5), 16) / 255;
    let b = parseInt(str.substring(5, 7), 16) / 255;
    let a = parseInt(str.substring(7, 9), 16) / 255;
    return new Vector4(r, g, b, 1);
  }

  public static Lerp(from: Vector4, to: Vector4, perc: number): Vector4 {
    return new Vector4(
      MyUtils.lerp(from.x, to.x, perc),
      MyUtils.lerp(from.y, to.y, perc),
      MyUtils.lerp(from.z, to.z, perc),
      MyUtils.lerp(from.w, to.w, perc)
    );
  }

  set(v: Vector4) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
  }

  add(v: Vector4): Vector4 {
    return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
  }

  equals(other: Vector4) {
    return (
      this.x == other.x &&
      this.y == other.y &&
      this.z == other.z &&
      this.w == other.w
    );
  }

  toVector4Int(): Vector4 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    this.w = Math.round(this.w);
    return this;
  }
}
