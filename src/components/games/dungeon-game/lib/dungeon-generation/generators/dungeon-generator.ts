import { DungeonNameGenerator } from "./dungeon-name-generator.ts";
import { DungeonStyleGenerator, DungeonFlavor } from "./dungeon-style-generator.ts";
import { DungeonLayoutGenerator } from "./dungeon-layout-generator.ts";
import type { DungeonFloor } from "../layout/entities/dungeon-floor.ts";

export class DungeonGenerator {
    public static generateDungeon(): Dungeon {
        const dungeonName = DungeonNameGenerator.generate();
        const dungeonStyle = DungeonStyleGenerator.generate();
        const floors = DungeonLayoutGenerator.generate();
        console.log(floors);

        return new Dungeon(dungeonName, dungeonStyle, floors);
    }
}

export class Dungeon {
    constructor(private name: string, private style: DungeonFlavor, private floors: DungeonFloor[]) {
    }

    public getFlavorText(): string {
        return this.name + ". Location: " + this.style.location + ". " + this.style.appearance + ". " + this.style.constructionType + " with " + this.style.lighting + " light.";
    }

    public get Name(): string {
        return this.name;
    }
}