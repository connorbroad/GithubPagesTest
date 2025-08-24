import {CorridorShape, DoorStatus, FloorSize, RoomShape, SegmentShape} from "../entities/dungeon-enums.ts";

export const numFloorsChance = [1, 1, 1, 2, 2, 3];

export const floorSizeChance = [
    FloorSize.Small,
    FloorSize.Small,
    FloorSize.Small,
    FloorSize.Medium,
    FloorSize.Medium,
    FloorSize.Medium,
    FloorSize.Large,
    FloorSize.Large,
    FloorSize.Mega,
];

export const segmentSizeChance = [2, 4, 6, 6, 8, 10];


// Basic = rectangle for rooms, straight line for corridors
export const segmentBasicShapeChance = [
    SegmentShape.Basic,
    SegmentShape.Basic,
    SegmentShape.Basic,
    SegmentShape.Basic,
    SegmentShape.Other,
    SegmentShape.Other,
];

export const roomOtherShapeChance = [
    RoomShape.Circle,
    RoomShape.Circle,
    RoomShape.Triangle,
    RoomShape.Cross,
    RoomShape.Pentagon,
    RoomShape.Hexagon,
];

export const corridorOtherShapeChance = [
    CorridorShape.U,
    CorridorShape.U,
    CorridorShape.L,
    CorridorShape.Cross,
    CorridorShape.T,
    CorridorShape.S,
];

export const doorStatusChance = [
    DoorStatus.Unlocked,
    DoorStatus.Unlocked,
    DoorStatus.Unlocked,
    DoorStatus.Unlocked,
    DoorStatus.Unlocked,
    DoorStatus.Locked,
    DoorStatus.Locked,
    DoorStatus.Locked,
    DoorStatus.Locked,
    DoorStatus.Stuck,
    DoorStatus.Stuck,
];