import {
    DoorLocation,
    DoorStatus,
    FloorSize,
    RoomShape,
    CorridorShape,
    SegmentShape
} from "../layout/entities/dungeon-enums";
import {
    numFloorsChance,
    floorSizeChance,
    segmentSizeChance,
    segmentBasicShapeChance,
    roomOtherShapeChance,
    corridorOtherShapeChance,
    doorStatusChance
} from "../layout/utility/dungeon-layout-chances";
import {DungeonFloor} from "../layout/entities/dungeon-floor.ts";
import {DungeonDoor, DungeonEntranceDoor} from "../layout/entities/dungeon-door.ts";
import {DungeonCorridor, DungeonRoom, type DungeonSegment} from "../layout/entities/dungeon-segment.ts";

const floorSizeToRoomDice: { [key in FloorSize]: any } = {
    [FloorSize.Small]: {
        d6: 1,
        min: 4,
    },
    [FloorSize.Medium]: {
        d6: 1,
        min: 8,
    },
    [FloorSize.Large]: {
        d6: 2,
        min: 12,
    },
    [FloorSize.Mega]: {
        d6: 3,
        min: 16,
    },
};

const possibleSegmentDoorLocations = [DoorLocation.North, DoorLocation.South, DoorLocation.East, DoorLocation.West];

// Notes:
// - The first room of each floor is the entrance or staircase room
// - The last room of the last floor is the boss room
// - The last room of each other floor is the stairs-up room
export class DungeonLayoutGenerator {
    public static generate(): DungeonFloor[] {
        let floors: DungeonFloor[] = [];

        let numFloors = 1;//this.generateNumberOfFloors();
        for (let i = 0; i < numFloors; i++) {
            floors.push(this.generateFloor(i));
        }

        return floors;
    }

    // Returns an empty list if no non-matching door locations are found, otherwise a list of two non-matching door locations, from room1 and room2's free door slots
    public static tryGetRandomCorridorConnectionSlotsBetweenRooms(room1ExistingDoors: DungeonDoor[], room2ExistingDoors: DungeonDoor[]): DoorLocation[] {
        let unusedDoorLocationsRoom1 = this.getAllFreeDoorLocationsForRoom(room1ExistingDoors);
        let unusedDoorLocationsRoom2 = this.getAllFreeDoorLocationsForRoom(room2ExistingDoors);

        // shuffle to hopefully make generation more interesting
        let shuffledUnusedDoorLocationsRoom1 = unusedDoorLocationsRoom1.sort(() => Math.random() - 0.5);
        let shuffledUnusedDoorLocationsRoom2 = unusedDoorLocationsRoom2.sort(() => Math.random() - 0.5);

        for (let room1FreeDoorLocation of shuffledUnusedDoorLocationsRoom1) {
            for (let room2FreeDoorLocation of shuffledUnusedDoorLocationsRoom2) {
                if (room1FreeDoorLocation != room2FreeDoorLocation) {
                    return [room1FreeDoorLocation, room2FreeDoorLocation];
                }
            }
        }

        return [];
    }

    // generates a certain number of rooms on this floor, connected by corridors 
    private static generateFloor(floorNum: number): DungeonFloor {
        let startingSegment = this.getStartingSegment(floorNum);
        let floor = new DungeonFloor(startingSegment);

        if (floorNum == 0) {
            let entranceDoor = new DungeonEntranceDoor();
            entranceDoor.setSegment(startingSegment, DoorLocation.South);
            floor.doors.push(entranceDoor);
        }

        this.generateLayout(floor);
        return floor;
    }

    private static generateNumberOfFloors(): number {
        return Math.floor(Math.random() * numFloorsChance.length) + 1;
    }

    private static getStartingSegment(floorNum: number): DungeonSegment {
        if (floorNum == 0) {
            // if (Math.random() < 0.5)
            //     return this.generateRoom();
            // else
            return this.generateCorridor();
        } else {
            // each floor starts with a room
            // consider changing this if stairs can be implemented in corridors nicely.
            return this.generateRoom();
        }
    }

    // requires that the floor has a starting segment
    private static generateLayout(floor: DungeonFloor) {
        if (!floor.startingSegment) {
            throw new Error("Floor must have a starting segment to generate layout");
        }

        floor.size = this.generateFloorSize();
        let numRooms = this.generateNumberOfRooms(floor.size);
        console.log("Generating " + numRooms + " rooms for floor size " + FloorSize[floor.size]);

        while (floor.rooms.length < numRooms) {
            this.generateFloorCorridorsFromRooms(floor);
            this.generateFloorRoomsFromCorridors(floor, numRooms);
        }
        //this.generateExtraCorridorConnections(floor, numRooms); // for more connected dungeons
    }

    private static generateExtraCorridorConnections(floor: DungeonFloor, numRooms: number) {
        // generate additional corridors to connect some random rooms
        const numExtraCorridors = 5;
        for (let i = 0; i < numExtraCorridors; i++) {
            let room1 = floor.rooms[Math.floor(Math.random() * floor.rooms.length)];
            let room2 = floor.rooms[Math.floor(Math.random() * floor.rooms.length)];
            if (room1 == room2) continue;

            let room1ExistingDoors = floor.doors.filter(door => door.Room == room1);
            let room2ExistingDoors = floor.doors.filter(door => door.Room == room2);
            let corridorConnection = this.tryGetRandomCorridorConnectionSlotsBetweenRooms(room1ExistingDoors, room2ExistingDoors);
            if (corridorConnection.length == 0) continue;

            let door1RoomPosition = corridorConnection[0];
            let door2RoomPosition = corridorConnection[1];
            let door1CorridorPosition = this.getOppositeDoorLocation(door1RoomPosition);
            let door2CorridorPosition = this.getOppositeDoorLocation(door2RoomPosition);

            let corridor = this.generateCorridor();
            floor.corridors.push(corridor);

            let door1 = new DungeonDoor();
            door1.setRoom(room1, door1RoomPosition);
            door1.setCorridor(corridor, door1CorridorPosition);

            let door2 = new DungeonDoor();
            door2.setRoom(room2, door2RoomPosition);
            door2.setCorridor(corridor, door2CorridorPosition);

            floor.doors.push(door1);
            floor.doors.push(door2);
        }
    }

    private static generateFloorCorridorsFromRooms(floor: DungeonFloor) {
        // for each room with a free door space, generate a corridor (with chance to fail)
        let roomsWithFreeDoors = floor.rooms.filter(room => floor.doors.filter(door => door.Room == room).length < 4); // rooms where there are less than 4 doors assigned to that room
        let shuffledRooms = roomsWithFreeDoors.sort(() => Math.random() - 0.5);
        for (let room of shuffledRooms) {
            const chancesToGenerateCorridor = 2;
            const roomDoors = floor.doors.filter(door => door.Room == room);
            for (let i = 0; i < chancesToGenerateCorridor; i++) {
                if (!this.passedSegmentGenerationChanceCheck()) continue;

                let corridor = this.generateCorridor();
                floor.corridors.push(corridor);

                let door = new DungeonDoor();
                let doorRoomPosition = this.getRandomFreeDoorLocationForRoom(roomDoors);
                let oppositeDoorPosition = this.getOppositeDoorLocation(doorRoomPosition);
                door.setRoom(room, doorRoomPosition);
                door.setCorridor(corridor, oppositeDoorPosition);

                floor.doors.push(door);
            }
        }
    }

    private static generateFloorRoomsFromCorridors(floor: DungeonFloor, numDesiredRooms: number) {
        // for each corridor with a free door space, generate a room 
        let corridorsWithFreeDoors = floor.corridors.filter(corridor => floor.doors.filter(door => door.Corridor == corridor).length < 2);
        let shuffledCorridors = corridorsWithFreeDoors.sort(() => Math.random() - 0.5);
        for (let corridor of shuffledCorridors) {
            const chancesToGenerateRoom = 1;
            const corridorDoors = floor.doors.filter(door => door.Corridor == corridor);
            for (let i = 0; i < chancesToGenerateRoom; i++) {
                if (!this.passedSegmentGenerationChanceCheck()) continue;

                if (floor.rooms.length >= numDesiredRooms) break;
                let room = this.generateRoom();
                floor.rooms.push(room);

                let door = new DungeonDoor();
                let corridorDoorPosition = this.getRandomFreeDoorLocationForCorridor(corridorDoors);
                let oppositeDoorPosition = this.getOppositeDoorLocation(corridorDoorPosition);
                door.setCorridor(corridor, corridorDoorPosition);
                door.setRoom(room, oppositeDoorPosition);

                floor.doors.push(door);
            }
        }
    }

    private static getRandomFreeDoorLocationForRoom(roomDoors: DungeonDoor[]): DoorLocation {
        let availableDoorLocations = this.getAllFreeDoorLocationsForRoom(roomDoors);
        return availableDoorLocations[Math.floor(Math.random() * availableDoorLocations.length)];
    }

    private static getAllFreeDoorLocationsForRoom(existingDoorsInRoom: DungeonDoor[]): DoorLocation[] {
        let takenDoorLocations = existingDoorsInRoom.map(door => door.RoomDoorLocation);
        return possibleSegmentDoorLocations.filter(doorLocation => !takenDoorLocations.includes(doorLocation));
    }

    private static getRandomFreeDoorLocationForCorridor(existingDoorsInCorridor: DungeonDoor[]): DoorLocation {
        let takenDoorLocations = existingDoorsInCorridor.map(door => door.CorridorDoorLocation);
        let availableDoorLocations = possibleSegmentDoorLocations.filter(doorLocation => !takenDoorLocations.includes(doorLocation));
        return availableDoorLocations[Math.floor(Math.random() * availableDoorLocations.length)];
    }

    private static getOppositeDoorLocation(doorLocation: DoorLocation): DoorLocation {
        switch (doorLocation) {
            case DoorLocation.North:
                return DoorLocation.South;
            case DoorLocation.South:
                return DoorLocation.North;
            case DoorLocation.East:
                return DoorLocation.West;
            case DoorLocation.West:
                return DoorLocation.East;
        }
    }

    private static passedSegmentGenerationChanceCheck(): boolean {
        return Math.random() < 0.33;
    }

    private static generateNumberOfRooms(floorSize: FloorSize): number {
        return 3;
        let dice = floorSizeToRoomDice[floorSize].d6;
        let numRooms = 0;
        for (let i = 0; i < dice; i++) {
            numRooms += Math.floor(Math.random() * 6) + 1;
        }

        let min = floorSizeToRoomDice[floorSize].min;
        return numRooms + min;
    }

    private static generateFloorSize(): FloorSize {
        return FloorSize.Small;
        return floorSizeChance[Math.floor(Math.random() * floorSizeChance.length)];
    }

    // Returns a doorless room with a random size and shape
    private static generateRoom(): DungeonRoom {
        let room = new DungeonRoom();
        room.size = this.generateRoomSize();
        room.shape = this.generateRoomsShape();
        return room;
    }

    private static generateRoomSize(): number {
        return Math.floor(Math.random() * segmentSizeChance.length) + 1;
    }

    private static generateRoomsShape(): RoomShape {
        let basicShape = segmentBasicShapeChance[Math.floor(Math.random() * segmentBasicShapeChance.length)];
        if (basicShape == SegmentShape.Basic)
            return RoomShape.Basic;
        return roomOtherShapeChance[Math.floor(Math.random() * roomOtherShapeChance.length)];
    }

    // Returns a doorless corridor with a random size and shape
    private static generateCorridor(): DungeonCorridor {
        let corridor = new DungeonCorridor();
        corridor.size = this.generateCorridorSize();
        corridor.shape = this.generateCorridorShape();
        return corridor;
    }

    private static generateCorridorSize(): number {
        return Math.floor(Math.random() * segmentSizeChance.length);
    }

    private static generateCorridorShape(): CorridorShape {
        let basicShape = segmentBasicShapeChance[Math.floor(Math.random() * segmentBasicShapeChance.length)];
        if (basicShape == SegmentShape.Basic)
            return CorridorShape.Basic;
        return corridorOtherShapeChance[Math.floor(Math.random() * corridorOtherShapeChance.length)];
    }

    private static generateRandomDoorStatus(): DoorStatus {
        return doorStatusChance[
            Math.floor(Math.random() * doorStatusChance.length)
            ];
    }
}
