
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Spawns } from "types/Spawns";
export class PowerPoint {
    source: Source;

    maxCreeps: number;
    creeps: {[id: string]: Creep};

    constructor(source: Source, maxCreeps: number) {
        this.source = source;
        this.maxCreeps = maxCreeps;
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
        room.visual.text("⚡ SCANNING...", 1, 1, {color: '#FF0000', align: 'left'});

        const sources = room.find(FIND_SOURCES);
        sources.forEach((source: Source) => {
            const pos = source.pos;
            const terrain = room.getTerrain();
            let maxCreeps = 8;

            // TOP ROW
            if(terrain.get(pos.x - 1, pos.y - 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x, pos.y - 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x + 1, pos.y - 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;

            // MIDDLE ROW
            if(terrain.get(pos.x - 1, pos.y) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x + 1, pos.y) === TERRAIN_MASK_WALL) maxCreeps -= 1;

            // BOTTOM ROW
            if(terrain.get(pos.x - 1, pos.y + 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x, pos.y + 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x + 1, pos.y + 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;

            console.log(`Source ${source.id} can support up to ${maxCreeps} creeps!`);
            if(maxCreeps > 0) this.points[source.id] = new PowerPoint(source, maxCreeps);
        });

        room.visual.text(`⚡ FOUND: ${sources.length}`, 1, 2, {color: '#FF0000', align: 'left'});
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