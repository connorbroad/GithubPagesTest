import {FloorSize} from "./dungeon-enums.ts";
import {DungeonCorridor, DungeonRoom, type DungeonSegment} from "./dungeon-segment.ts";
import {DungeonDoor} from "./dungeon-door.ts";

export class DungeonFloor {
    size: FloorSize;
    rooms: DungeonRoom[] = [];
    corridors: DungeonCorridor[] = [];
    doors: DungeonDoor[] = [];

    startingSegment: DungeonSegment;

    constructor(startingSegment: DungeonSegment) {
        this.startingSegment = startingSegment;
        if (startingSegment instanceof DungeonRoom) {
            this.rooms.push(startingSegment);
        } else if (startingSegment instanceof DungeonCorridor) {
            this.corridors.push(startingSegment);
        }
    }
}