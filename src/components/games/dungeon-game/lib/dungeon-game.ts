import * as THREE from "three";
import { Dungeon, DungeonGenerator } from "./dungeon-generation/generators/dungeon-generator.ts";
import { TextUtils } from "../../_utils/text-utils.ts";
import type { BiimoGame } from "../../_base/biimo-game.ts";
import { BiimoButton } from "../../_utils/game-utils.ts";

export class DungeonGame implements BiimoGame {
    scene: THREE.Scene;
    dungeon: Dungeon;

    constructor(scene: THREE.Scene) {
        this.setUpKeyboardListener();
        this.dungeon = DungeonGenerator.generateDungeon();
    }

    handleBiimoInput(buttonId: BiimoButton): void {
        switch (buttonId) {
            case BiimoButton.Up:
                console.log("D-pad Up pressed");
                break;
            case BiimoButton.Down:
                console.log("D-pad Down pressed");
                break;
            case BiimoButton.Left:
                console.log("D-pad Left pressed");
                break;
            case BiimoButton.Right:
                console.log("D-pad Right pressed");
                break;
            default:
                console.log("Unknown D-pad button pressed");
        }
        console.error("DungeonGame input not fully implemented");
    }

    init(scene: THREE.Scene, gameWidth: number, gameHeight: number): void {
        this.scene = scene;

        let dungeonTextForTitle = this.getTitle(this.dungeon.Name);
        TextUtils.addText(this.scene, dungeonTextForTitle, 0.5, 0.8, 0.9);
    }

    private getTitle(title: string) {
        // Split the title into lines of 2 words each
        let splitWords = title.trim().split(" ");
        if (splitWords.length > 2) {
            let d = [];
            for (let i = 0; i < splitWords.length; i += 2) {
                let part1 = splitWords[i];
                let part2 = splitWords[i + 1] ?? "";
                d.push(part1 + " " + part2);
            }
            title = d.join("\n");
        }
        return title;
    }

    update(timeDeltaS: number): void {

    }

    private setUpKeyboardListener() {
        window.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    private onKeyDown(e: KeyboardEvent) {

    }
}
