import {CorridorShape, RoomShape} from "./dungeon-enums.ts";

export interface DungeonSegment {
}

export class DungeonRoom implements DungeonSegment {
    id: string = crypto.randomUUID().toUpperCase().substring(0, 8)
    size: number;
    shape: RoomShape;
}

export class DungeonCorridor implements DungeonSegment {
    id: string = crypto.randomUUID().toUpperCase().substring(0, 8)
    size: number;
    shape: CorridorShape;
}