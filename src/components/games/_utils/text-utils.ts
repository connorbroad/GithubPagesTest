import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

export class TextUtils {
    private static fontLoader = new FontLoader();
    private static fontPathNormal = "/github-pages-test/biimo/utils/fonts/SyneMono_Regular.json";
    private static fontPathBold = "/github-pages-test/biimo/utils/fonts/Potta One_Regular.json";

    public static addText(
        scene: THREE.Scene,
        text: string,
        posX: number,
        posY: number,
        textWidth: number, // % of the screen width
        bold: boolean = false
    ): THREE.Group {
        let group = new THREE.Group();
        group.position.x = posX;
        group.position.y = posY;

        let fontPath = bold ? this.fontPathBold : this.fontPathNormal;

        this.fontLoader.load(fontPath, (font) => {
            let geometry = new TextGeometry(text, {
                font: font,
                size: 1, // control size via textWidth instead
                depth: 0.0,
                curveSegments: 12,
                bevelEnabled: false
            });

            const maxXWidth = textWidth;
            geometry.computeBoundingBox();
            geometry.scale(maxXWidth / geometry.boundingBox.max.x, maxXWidth / geometry.boundingBox.max.x, maxXWidth / geometry.boundingBox.max.x);
            const centerOffsetX = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            const centerOffsetY = 0.05 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);

            let material = new THREE.MeshBasicMaterial({ color: new THREE.Color("black") });
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = centerOffsetX;
            mesh.position.y = centerOffsetY;
            mesh.position.z = 0;

            group.add(mesh);
        });

        scene.add(group);
        return group;
    }
}