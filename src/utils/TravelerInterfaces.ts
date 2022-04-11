export interface PathfinderReturn {
    path: RoomPosition[];
    ops: number;
    cost: number;
    incomplete: boolean;
}

export interface TravelToReturnData {
    nextPos?: RoomPosition;
    pathfinderReturn?: PathfinderReturn;
    state?: TravelState;
    path?: string;
}

export interface TravelToOptions {
    ignoreRoads?: boolean;
    ignoreCreeps?: boolean;
    ignoreStructures?: boolean;
    preferHighway?: boolean;
    highwayBias?: number;
    allowHostile?: boolean;
    allowSK?: boolean;
    range?: number;
    obstacles?: {pos: RoomPosition}[];
    roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
    routeCallback?: (roomName: string) => number;
    returnData?: TravelToReturnData;
    restrictDistance?: number;
    useFindRoute?: boolean;
    maxOps?: number;
    movingTarget?: boolean;
    freshMatrix?: boolean;
    offRoad?: boolean;
    stuckValue?: number;
    maxRooms?: number;
    repath?: number;
    route?: {[roomName: string]: boolean};
    ensurePath?: boolean;
    style?: any;
}

export interface TravelData {
    state: any[];
    path: string;
}

export interface TravelState {
    stuckCount: number;
    lastCoord: Coord;
    destination: RoomPosition;
    cpu: number;
}

declare global {
    interface Creep {
        travelTo(destination: HasPos|RoomPosition, ops?: TravelToOptions): number;
    }

    interface CreepMemory {
        _trav: TravelData|any;
        _travel: TravelData;
    }

    interface RoomMemory {
        avoid: number;
    }

    interface Memory {
        empire: any;
    }
}

export type Coord = {x: number, y: number};
export type HasPos = {pos: RoomPosition}