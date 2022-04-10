
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Spawns } from "types/Spawns";
export class PowerPoint {
    source: Source;

    maxCreeps: number;
    creeps: {[id: string]: Creep};

    constructor(source: Source) {
        this.source = source;
        this.maxCreeps = 2;
        this.creeps = {};
    }

    public addCreep(creep: Creep) {
        this.creeps[creep.id] = creep;
    }

    public removeCreep(creep: Creep) {
        delete this.creeps[creep.id];
    }

    public isFull(): boolean {
        return Object.keys(this.creeps).length >= this.maxCreeps;
    }
}

export class PowerPointsController {
    public static points?: {[id: string]: PowerPoint};

    public static scan(spawnID: Spawns = "Spawn1"): void {
        if(this.points != null) return;
        this.points = {}; // Cleanup

        const room = Game.spawns[spawnID].room;
        Game.map.visual.text("⚡ SCANNING...", new RoomPosition(10, 10, room.name), {color: '#FF0000', fontSize: 10});

        const sources = room.find(FIND_SOURCES);
        sources.forEach((source: Source) => {
            this.points[source.id] = new PowerPoint(source);
        });

        Game.map.visual.text(`⚡ FOUND: ${sources.length}`, new RoomPosition(0, 0, room.name), {color: '#FF0000', fontSize: 10});
    }

    public static get(id: string) : PowerPoint | null {
        return this.points[id];
    }

    public static getAvaliableSource() : PowerPoint | null {
        if(this.points == null) return null;
        return Object.values(this.points).find((source) => !source.isFull());
    }

    public static registerCreep(id: string, creep: Creep) {
        const source = this.points[id];
        if(!source || source.isFull()) return;
        source.addCreep(creep);
    }

    public static unregisterCreep(id: string, creep: Creep) {
        const source = this.points[id];
        if(!source) return;
        source.removeCreep(creep);
    }
}