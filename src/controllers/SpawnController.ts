
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Spawns } from "types/Spawns";

export type CreepRole = 'Harvester' | 'Upgrader' | 'Builder' | 'Maintainer' | 'Attacker';

const TOTAL_HARVEST_LVL_2: number = 3;
const TOTAL_HARVEST: number = 4;

const TOTAL_BUILDER: number = 2;
const TOTAL_UPGRADER: number = 1;
const TOTAL_MAINTAINER: number = 1;
const TOTAL_ATTACKER: number = 2;

export class SpawnController {

    public static run(spawnID: Spawns = "Spawn1"): void {
        // RESPAWN ---
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'Harvester');
        const harvestersLVL1 = _.filter(harvesters, (creep) => creep.memory.level == 1);
        const harvestersLVL2 = _.filter(harvesters, (creep) => creep.memory.level == 2);

        const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'Builder');
        const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'Upgrader');
        const maintainers = _.filter(Game.creeps, (creep) => creep.memory.role === 'Maintainer');
        const attacker = _.filter(Game.creeps, (creep) => creep.memory.role === 'Attacker');

        const spawn = Game.spawns[spawnID];

        if(harvestersLVL1.length < TOTAL_HARVEST && spawn.spawnCreep([WORK, WORK, CARRY, MOVE, MOVE], "Harvester_" + Game.time, {memory: {role: 'Harvester', level: 1}}) == OK) return;
        if(harvestersLVL2.length < TOTAL_HARVEST_LVL_2 && spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], "Harvester_LVL2_" + Game.time, {memory: {role: 'Harvester', level: 2}}) == OK) return;

        if(builders.length < TOTAL_BUILDER && spawn.spawnCreep([WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], "Builders_" + Game.time, {memory: {role: 'Builder', level: 2}}) == OK) return;
        if(upgraders.length < TOTAL_UPGRADER && spawn.spawnCreep([WORK, CARRY, MOVE], "Upgraders_" + Game.time, {memory: {role: 'Upgrader', level: 1}}) == OK) return;
        if(maintainers.length < TOTAL_MAINTAINER && spawn.spawnCreep([WORK, CARRY, MOVE], "Maintainers_" + Game.time, {memory: {role: 'Maintainer', level: 1}}) == OK) return;
        if(attacker.length < TOTAL_ATTACKER && spawn.spawnCreep([ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], "Attacker_" + Game.time, {memory: {role: 'Attacker', level: 2}}) == OK) return;
    }
}