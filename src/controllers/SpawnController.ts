
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Spawns } from "types/Spawns";

export type CreepRole = 'Harvester' | 'Upgrader' | 'Builder' | 'Maintainer';

const TOTAL_HARVEST: number = 10;
const TOTAL_BUILDER: number = 4;
const TOTAL_UPGRADER: number = 1;
const TOTAL_MAINTAINER: number = 1;

export class SpawnController {

    public static run(spawnID: Spawns = "Spawn1"): void {
        // RESPAWN ---
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'Harvester');
        const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'Builder');
        const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'Upgrader');
        const maintainers = _.filter(Game.creeps, (creep) => creep.memory.role === 'Maintainer');

        const spawn = Game.spawns[spawnID];

        if(harvesters.length < TOTAL_HARVEST && spawn.spawnCreep([WORK, CARRY, MOVE], "Harvester" + Game.time, {memory: {role: 'Harvester'}}) == OK) return;
        if(builders.length < TOTAL_BUILDER && spawn.spawnCreep([WORK, CARRY, MOVE], "Builders" + Game.time, {memory: {role: 'Builder'}}) == OK) return;
        if(upgraders.length < TOTAL_UPGRADER && spawn.spawnCreep([WORK, CARRY, MOVE], "Upgraders" + Game.time, {memory: {role: 'Upgrader'}}) == OK) return;
        if(maintainers.length < TOTAL_MAINTAINER && spawn.spawnCreep([WORK, CARRY, MOVE], "Maintainers" + Game.time, {memory: {role: 'Maintainer'}}) == OK) return;
    }
}