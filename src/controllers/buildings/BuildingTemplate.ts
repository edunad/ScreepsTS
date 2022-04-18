import _ from "lodash";
import { getHive } from "index";
import { CreepRole } from "types/CreepRole";
import { DiamondTemplate } from "./DiamondTemplate";

export interface ControllerBuildingsCount {
    containers?: number;
    spawns?: number;
    extentions?: number;
    ramparts?: number;
    walls?: number;
    towers?: number;
    storages?: number;
    links?: number;
    labs?: number;
    terminals?: number;
    factories?: number;
    observers?: number;
    powerSpawners?: number;
    nukes?: number;
    extractors?: number;
}

const buildingsPerLevel: ControllerBuildingsCount[] = [
    /* 0 */ { }, // NOTE: level 0 is 5 containers, but we dont want to build them yet here
    /* 1 */ { spawns: 1, containers: 1, }, // TODO: we got 5 containers, but only need 1 per source
    /* 2 */ { extentions: 5, },
    /* 3 */ { extentions: 5, towers: 1, },
    /* 4 */ { extentions: 10, /*storages: 1,*/ },
    /* 5 */ { extentions: 10, towers: 1, /*links: 2,*/ },
    /* 6 */ { extentions: 10, labs: 3, terminals: 1, extractors: 1, },
    /* 7 */ { extentions: 10, towers: 1, spawns: 1, factories: 1, },
    /* 8 */ { towers: 3, observers: 1, nukes: 1, },
];

export class BuildingTemplate {
    public room: Room;
    public template: DiamondTemplate;

    constructor(room: Room) {
        this.room = room;
        this.template = new DiamondTemplate(room);
    }

    private buildingFieldNameToType(key: string): BuildableStructureConstant {
        switch(key) {
            case 'containers': return STRUCTURE_CONTAINER;
            case 'extentions': return STRUCTURE_EXTENSION;
            case 'extractors': return STRUCTURE_EXTRACTOR;
            case 'factories': return STRUCTURE_FACTORY;
            case 'labs': return STRUCTURE_LAB;
            case 'links': return STRUCTURE_LINK;
            case 'nukes': return STRUCTURE_NUKER;
            case 'observers': return STRUCTURE_OBSERVER;
            case 'powerSpawners': return STRUCTURE_POWER_SPAWN;
            case 'ramparts': return STRUCTURE_RAMPART;
            case 'spawns': return STRUCTURE_SPAWN;
            case 'storages': return STRUCTURE_STORAGE;
            case 'terminals': return STRUCTURE_TERMINAL;
            case 'towers': return STRUCTURE_TOWER;
            case 'walls': return STRUCTURE_WALL;
            default: return null;
        }
    }

    public getBuildingCounts(): ControllerBuildingsCount {
        const s = this.room.find(FIND_STRUCTURES);

        return {
            containers: s.filter((x) => x.structureType === STRUCTURE_CONTAINER).length,
            extentions: s.filter((x) => x.structureType === STRUCTURE_EXTENSION).length,
            extractors: s.filter((x) => x.structureType === STRUCTURE_EXTRACTOR).length,
            factories: s.filter((x) => x.structureType === STRUCTURE_FACTORY).length,
            labs: s.filter((x) => x.structureType === STRUCTURE_LAB).length,
            links: s.filter((x) => x.structureType === STRUCTURE_LINK).length,
            nukes: s.filter((x) => x.structureType === STRUCTURE_NUKER).length,
            observers: s.filter((x) => x.structureType === STRUCTURE_OBSERVER).length,
            powerSpawners: s.filter((x) => x.structureType === STRUCTURE_POWER_SPAWN).length,
            ramparts: s.filter((x) => x.structureType === STRUCTURE_RAMPART).length,
            spawns: s.filter((x) => x.structureType === STRUCTURE_SPAWN).length,
            storages: s.filter((x) => x.structureType === STRUCTURE_STORAGE).length,
            terminals: s.filter((x) => x.structureType === STRUCTURE_TERMINAL).length,
            towers: s.filter((x) => x.structureType === STRUCTURE_TOWER).length,
            walls: s.filter((x) => x.structureType === STRUCTURE_WALL).length,
        }
    }

    public getBuildingCountsNeeded(): ControllerBuildingsCount {
        const counter: ControllerBuildingsCount = {
            containers: 0,
            extentions: 0,
            extractors: 0,
            factories: 0,
            labs: 0,
            links: 0,
            nukes: 0,
            observers: 0,
            powerSpawners: 0,
            ramparts: 0,
            spawns: 0,
            storages: 0,
            terminals: 0,
            towers: 0,
            walls: 0,
        };

        for (let i = 0; i <= this.room.controller?.level; i++) {
            const map = buildingsPerLevel[i];

            counter.containers += map.containers ?? 0;
            counter.extentions += map.extentions ?? 0;
            counter.extractors += map.extractors ?? 0;
            counter.factories += map.factories ?? 0;
            counter.labs += map.labs ?? 0;
            counter.links += map.links ?? 0;
            counter.nukes += map.nukes ?? 0;
            counter.observers += map.observers ?? 0;
            counter.powerSpawners += map.powerSpawners ?? 0;
            counter.ramparts += map.ramparts ?? 0;
            counter.spawns += map.spawns ?? 0;
            counter.storages += map.storages ?? 0;
            counter.terminals += map.terminals ?? 0;
            counter.towers += map.towers ?? 0;
            counter.walls += map.walls ?? 0;
        }

        return counter;
    }

    public needsKaren(): boolean {
        // while in level 1 stage, we need external support
        if (this.room.controller?.level > 1) return false;

        // karens of the world, unite! this this is your moment
        const gotSpawner = this.room.find(FIND_MY_STRUCTURES).filter((x) => x.structureType == STRUCTURE_SPAWN).length != 0;
        const gotKarens = getHive().creeps.filter((x) => x.obj.memory.role === CreepRole.Karen && x.obj.room.name === this.room.name).length >= 2;
        return !gotSpawner && !gotKarens;
    }

    private getNextBuilding() : BuildableStructureConstant {
        const current = this.getBuildingCounts();
        const needed = this.getBuildingCountsNeeded();

        for (let key in current) {
            if (needed[key] > current[key]) {
                console.log(`We need to make more ${key}!`);
                return this.buildingFieldNameToType(key);
            }
        }

        return null;
    }

    public tick(): void {
        if (this.room.find(FIND_CONSTRUCTION_SITES).length > 0) return;

        const next = this.getNextBuilding();
        if (!next) {
            const nextRoad = this.template.getNextRoad();
            if (!nextRoad) return;

            this.room.createConstructionSite(nextRoad.x, nextRoad.y, STRUCTURE_ROAD);
            return;
        }

        const spot = this.template.findSpot(next);
        if (!spot) {
            console.log('build controller is having an interal derp :(');
            return;
        }

        if (next === STRUCTURE_SPAWN) {
            this.room.createConstructionSite(spot.x, spot.y, next, `Bob's cave`);
        } else {
            this.room.createConstructionSite(spot.x, spot.y, next);
        }
    }

    public isDone(): boolean {
        return this.room.find(FIND_CONSTRUCTION_SITES).length == 0;
    }
}
