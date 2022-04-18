import _ from "lodash";
import { getHive } from "index";
import { CreepRole } from "types/CreepRole";
import { DiamondTemplate } from "./DiamondTemplate";
import { SourceController } from "controllers/SourceController";
import { Traveler } from "utils/Traveler";

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
    /* 1 */ { spawns: 1, containers: 5, },
    /* 2 */ { extentions: 5, },
    /* 3 */ { extentions: 5, towers: 1, },
    /* 4 */ { extentions: 10, /*storages: 1,*/ },
    /* 5 */ { extentions: 10, towers: 1, links: 2, },
    /* 6 */ { extentions: 10, labs: 3, terminals: 1, extractors: 1, links: 1, },
    /* 7 */ { extentions: 10, towers: 1, labs: 3, spawns: 1, factories: 1, /*links: 1,*/ },
    /* 8 */ { extentions: 10, towers: 3, observers: 1, spawns: 1, nukes: 1, labs: 4, },
];

declare global {
    interface RoomMemory {
        // paths from spawner to sources, minerals and controller
        pathsBuild:  {[id: string]: boolean};
    }
}

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

        const sources = this.room.find(FIND_SOURCES);
        const minerals = this.room.find(FIND_MINERALS);
        const sourceMult = this.room.controller.level > 2 ? 2 : 1
        if (needed.containers > sources.length * sourceMult) needed.containers = sources.length * sourceMult;
        if (needed.extractors > minerals.length) needed.extractors = minerals.length;
        if (current.spawns == 0 && needed.spawns > 0) return STRUCTURE_SPAWN; // always make spawn first

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
            if (this.room.controller.level < 2) return;

            let nextRoad = this.template.getNextRoad();
            if (!nextRoad) {
                // ok so all normal diamond roads are made, let's check the paths to the minerals and the controller

                const endpoints: RoomPosition[] = [].concat(
                    this.room.find(FIND_SOURCES).map((s) => s.pos),
                    this.room.controller.pos,
                    this.room.controller.level > 5 ? this.room.find(FIND_MINERALS).map((m) => m.pos) : [],
                );

                for (let i = 0; i < endpoints.length; i++) {
                    const endpointName = `${endpoints[i].x}_${endpoints[i].y}`;
                    let mem = Memory.rooms[this.room.name];
                    if (mem && mem.pathsBuild && mem.pathsBuild[endpointName]) continue;

                    const path = Traveler.findTravelPath(this.template.getSpawnerLocation(), endpoints[i], {ignoreCreeps: true, ignoreRoads: true, offRoad: true});
                    let done = true;
                    for (let j = 0; j < path.path.length; j++) {
                        const find = this.room.lookAt(path.path[j]).filter((x) => x.structure && !(x.structure instanceof StructureContainer || x.structure instanceof Ruin || x.structure instanceof Tombstone));
                        if (find.length > 0) continue;

                        nextRoad = path.path[j];
                        done = false;
                        break;
                    }

                    if (done) {
                        if (!mem) mem = Memory.rooms[this.room.name] = {avoid: 0, pathsBuild: {}};
                        if (!mem.pathsBuild) mem.pathsBuild = {};
                        mem.pathsBuild[endpointName] = true;
                        console.log("Path created to ", endpoints[i].x, endpoints[i].y);
                    }

                    break;
                }

                if (!nextRoad) return;
            }

            this.room.createConstructionSite(nextRoad.x, nextRoad.y, STRUCTURE_ROAD);
            return;
        }

        let spot = this.template.findSpot(next);
        if (!spot) {
            console.log('build controller is having an interal derp :(');
            return;
        }

        const linkCount = this.room.find(FIND_MY_STRUCTURES).filter((x) => x instanceof StructureLink).length;
        if (next === STRUCTURE_CONTAINER || (next == STRUCTURE_LINK && linkCount == 0)) {
            const sources = this.room.find(FIND_SOURCES);
            const numContainers = this.room.find(FIND_MY_STRUCTURES).filter((x) => x instanceof StructureContainer).length;
            const source = sources[numContainers % sources.length];
            const mineSpots = SourceController.findWalkableTiles(source.room, source.pos);

            let found = false;
            for (let i = 0; i < mineSpots.length; i++) {
                const places = SourceController.findWalkableTiles(source.room, mineSpots[i]);

                for (let i = 0; i < places.length; i++) {
                    if (this.room.lookAt(places[i]).filter((l) => (l.structure && l.structure.structureType != STRUCTURE_ROAD) || l.constructionSite).length == 0) {
                        spot = places[i];
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                console.log('DERP container/link', mineSpots.length);
                return;
            }
        }

        if (next == STRUCTURE_LINK && linkCount == 2) {
            let found = false;
            const linkSpots = SourceController.findWalkableTiles(this.room, this.room.controller.pos);
            for (let i = 0; i < linkSpots.length; i++) {
                if (this.room.lookAt(linkSpots[i]).filter((l) => (l.structure && l.structure.structureType != STRUCTURE_ROAD) || l.constructionSite).length == 0) {
                    spot = linkSpots[i];
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log('DERP link', linkSpots.length);
                return;
            }
        }

        if (next === STRUCTURE_EXTRACTOR) {
            const minerals = this.room.find(FIND_MINERALS);
            const numExtractors = this.room.find(FIND_MY_STRUCTURES).filter((x) => x instanceof StructureExtractor).length;
            const mineral = minerals[numExtractors % minerals.length];
            spot = mineral.pos;
        }

        if (next === STRUCTURE_SPAWN) {
            const spawners = this.room.find(FIND_MY_STRUCTURES).filter((x) => x.structureType == STRUCTURE_SPAWN).length;
            const names = [`Bob's cave`, `Mina's cave`, `/shrug`];
            this.room.createConstructionSite(spot.x, spot.y, next, names[spawners]);
        } else {
            this.room.createConstructionSite(spot.x, spot.y, next);
        }
    }

    public isDone(): boolean {
        return this.room.find(FIND_CONSTRUCTION_SITES).length == 0;
    }
}
