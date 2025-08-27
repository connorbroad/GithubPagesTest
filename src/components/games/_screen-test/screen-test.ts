import type { Scene } from "three";
import type { BiimoGame } from "../_base/biimo-game.ts";
import * as THREE from "three";
import {TextUtils} from "../_utils/text-utils.ts";

export class ScreenTest implements BiimoGame {
    scene: THREE.Scene;
    gameWidth: number;
    gameHeight: number;
    canvasWidth: number;
    canvasHeight: number;

    numCellsWide = 17;
    cellWidth = 1 / this.numCellsWide;    
    
    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    readonly testImageUrl = "../../games/dungeon/screen-test/test-image.png";
    readonly fontPath = "../../games/_utils/fonts/SyneMono_Regular.json"; // get the json version of a ttf at https://gero3.github.io/facetype.js/


    readonly goblinSpriteSheetUrl = "../../games/dungeon/sprite-sheets/sprite-sheet.png";

    init(scene: Scene, gameWidth: number, gameHeight: number): void {
        this.scene = scene;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.addUVSquare(0, 0);
        this.addShapes(0, 0.5);

        this.addSpriteSheetImage(32, 20, 4, 4, 4);

        let knight = {
            spritePosX: 28,
            spritePosY: 20,
            spriteCellsWide: 2
        }
        let knightCellX = 2;
        let knightCellY = 1;
        this.addSpriteSheetImage(knight.spritePosX, knight.spritePosY, knight.spriteCellsWide, knightCellX, knightCellY);

        let titleText = TextUtils.addText(this.scene, "Dungeon of\nCursed Shadow", 0.5, 0.5, 0.9);
    }

    update(timeDeltaS: number): void {

    }

    private addUVSquare(posX: number, posY: number, areaWidth = 1, areaHeight = 1) {
        let group = new THREE.Group();
        group.position.x = posX;
        group.position.y = posY;

        let cubeWidth = areaWidth / this.numCellsWide;
        let cubeHeight = areaHeight / this.numCellsWide;
        for (let j = 0; j < this.numCellsWide; j++) {
            for (let i = 0; i < this.numCellsWide; i++) {
                const geometry = new THREE.PlaneGeometry(cubeWidth, cubeHeight);
                let color = this.getColorForCell(i, j);
                const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.x = i * cubeWidth + (cubeWidth / 2);
                cube.position.y = j * cubeHeight + (cubeHeight / 2);
                group.add(cube);
            }
        }
        this.scene.add(group);
    }

    private addShapes(posX: number, posY: number, areaWidth = 0.5, areaHeight = 0.5) {
        let group = new THREE.Group();
        group.position.x = posX;
        group.position.y = posY;

        let square = new THREE.PlaneGeometry(0.1, 0.1);
        let squareMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color("red") });
        let squareMesh = new THREE.Mesh(square, squareMaterial);
        squareMesh.position.x = 0.1 * areaWidth;
        squareMesh.position.y = 0.1 * areaHeight;
        group.add(squareMesh);

        let circle = new THREE.CircleGeometry(0.05, 32);
        let circleMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color("blue") });
        let circleMesh = new THREE.Mesh(circle, circleMaterial);
        circleMesh.position.x = 0.3 * areaWidth;
        circleMesh.position.y = 0.3 * areaHeight;
        group.add(circleMesh);

        let triangle = new THREE.Shape();
        let triangleWidth = 0.1;
        let triangleHeight = 0.1;
        triangle.moveTo(0, 0);
        triangle.lineTo(triangleWidth, 0);
        triangle.lineTo(triangleWidth / 2, triangleHeight);
        triangle.lineTo(0, 0);
        let triangleGeometry = new THREE.ShapeGeometry(triangle);
        let triangleMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color("green") });
        let triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
        triangleMesh.position.x = 0.5 * areaWidth - 0.05;
        triangleMesh.position.y = 0.5 * areaHeight - 0.05;
        group.add(triangleMesh);

        let hexagon = new THREE.Shape();
        let hexagonWidth = 0.1;
        let hexagonHeight = 0.09;
        hexagon.moveTo(0, 0);
        hexagon.lineTo(hexagonWidth * 0.75, 0);
        hexagon.lineTo(hexagonWidth, hexagonHeight / 2);
        hexagon.lineTo(hexagonWidth * 0.75, hexagonHeight);
        hexagon.lineTo(hexagonWidth / 4, hexagonHeight);
        hexagon.lineTo(0, hexagonHeight / 2);
        hexagon.lineTo(hexagonWidth / 4, 0);
        let hexagonGeometry = new THREE.ShapeGeometry(hexagon);
        let hexagonMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color("purple") });
        let hexagonMesh = new THREE.Mesh(hexagonGeometry, hexagonMaterial);
        hexagonMesh.position.x = 0.7 * areaWidth - 0.05;
        hexagonMesh.position.y = 0.7 * areaHeight - 0.05;
        group.add(hexagonMesh);

        this.scene.add(group);
    }

    private getColorForCell(i: number, j: number): string {
        let perc = ((this.numCellsWide - i) + (this.numCellsWide - j)) / ((this.numCellsWide - 1) * 2);
        let shade = Math.floor(perc * 255);
        return "rgb(" + shade + "," + shade + ", " + shade + ")";
    }

    private addSpriteSheetImage(spritePosX: number, spritePosY: number, spriteCellsWide: number, posX: number, posY: number) {
        let url = this.goblinSpriteSheetUrl;

        let group = new THREE.Group();
        let spriteCellWidth = this.cellWidth * spriteCellsWide;
        let spriteCellHeight = this.cellWidth * spriteCellsWide;
        group.position.x = posX * this.cellWidth + (spriteCellWidth / 2);
        group.position.y = posY * this.cellWidth + (spriteCellWidth / 2);

        let loader = new THREE.TextureLoader();
        loader.load(url, (texture) => {
            // pixel art filtering - no interpolation
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;

            const spriteSheetCellsWide = 80;
            const spriteSheetCellsHigh = 40;
            let cellWidth = 1 / spriteSheetCellsWide;
            let cellHeight = 1 / spriteSheetCellsHigh;

            texture.repeat.set(cellWidth * spriteCellsWide, cellHeight * spriteCellsWide);
            texture.offset.set(cellWidth * spritePosX, cellHeight * spritePosY);

            let material = new THREE.SpriteMaterial({ map: texture, color: new THREE.Color("cyan") });
            let mesh = new THREE.Sprite(material);
            mesh.scale.set(spriteCellWidth, spriteCellHeight, 1);
            group.add(mesh);
        });

        this.scene.add(group);
    }
}