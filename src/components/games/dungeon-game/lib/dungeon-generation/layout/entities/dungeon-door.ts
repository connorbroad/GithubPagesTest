import {DoorLocation, DoorStatus} from "./dungeon-enums.ts";
import {DungeonCorridor, DungeonRoom, type DungeonSegment} from "./dungeon-segment.ts";

// each door describes each room and corridor it connects to
// including the door's location in that room and corridor
export class DungeonDoor {
    id: string = crypto.randomUUID().toUpperCase().substring(0, 8)
    status: DoorStatus = DoorStatus.Unlocked;

    private room: DungeonRoom;
    private roomDoorLocation: DoorLocation;
    private corridor: DungeonCorridor;
    private corridorDoorLocation: DoorLocation;

    // room getter
    public get Room(): DungeonRoom {
        return this.room;
    }

    public get Corridor(): DungeonCorridor {
        return this.corridor;
    }

    public get RoomDoorLocation(): DoorLocation {
        return this.roomDoorLocation;
    }

    public get CorridorDoorLocation(): DoorLocation {
        return this.corridorDoorLocation;
    }

    public setSegment(segment: DungeonSegment, doorLocation: DoorLocation) {
        if (segment instanceof DungeonRoom) {
            this.setRoom(segment, doorLocation);
        } else if (segment instanceof DungeonCorridor) {
            this.setCorridor(segment, doorLocation);
        }
    }

    public setRoom(room: DungeonRoom, roomDoorLocation: DoorLocation) {
        this.room = room;
        this.roomDoorLocation = roomDoorLocation;
    }

    public setCorridor(
        corridor: DungeonCorridor,
        corridorDoorLocation: DoorLocation
    ) {
        this.corridor = corridor;
        this.corridorDoorLocation = corridorDoorLocation;
    }
}

export class DungeonEntranceDoor extends DungeonDoor {
    constructor() {
        super();
        this.status = DoorStatus.Unlocked;
    }
}