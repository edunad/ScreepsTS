import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import type { LoDashStatic } from 'lodash';
declare var _: LoDashStatic;

import { Spawns } from 'types/Spawns';
import { SettingsController } from './SettingsController';
import { VarsController } from './VarsController';

export type CreepRole = 'Harvester' | 'Upgrader' | 'Builder' | 'Maintainer' | 'Attacker';
export type CreepParts = MOVE | WORK | CARRY | ATTACK | RANGED_ATTACK | TOUGH | HEAL | CLAIM;
export class SpawnController {
    private static hasCheckedRoom: { [id: string]: boolean } = {};
    private static templates: { [key in CreepRole]: { [id: number]: CreepParts[] } } = {
        Harvester: {
            1: [WORK, WORK, CARRY, MOVE, MOVE],
            2: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
            3: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        },
        Builder: {
            1: [WORK, CARRY, MOVE],
            2: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        },
        Upgrader: {
            1: [WORK, CARRY, MOVE],
            2: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        },
        Maintainer: {
            1: [WORK, CARRY, MOVE],
            2: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        },
        Attacker: {
            1: [TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK],
            2: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK],
        },
    };

    private static countCreeps(roomCreeps: Creep[], role: CreepRole, level: number = 1): Creep[] {
        return roomCreeps.filter((creep) => creep.memory.role === role && creep.memory.level === level);
    }

    public static scanRoom(roomName: string): void {
        const sleepDisabled = VarsController.isSet(`SPAWN_${roomName}_NO_SLEEP`);
        if (sleepDisabled) return;

        this.hasCheckedRoom[roomName] = false;
        console.log(`💊 Enabled spawn scanning for '${roomName}'`);
    }

    public static run(spawnID: Spawns = 'Spawn1'): void {
        const spawn = Game.spawns[spawnID];
        const roomName = spawn.room.name;
        if (spawn.spawning) return; // Already spawning a creep

        const sleepDisabled = VarsController.isSet(`SPAWN_${spawn.room.name}_NO_SLEEP`);
        if (!sleepDisabled && this.hasCheckedRoom[roomName]) {
            spawn.room.visual.text('💤', spawn.pos.x, spawn.pos.y, { color: '#ffffff', align: 'center' });
            return; // We already checked, and no creeps died... skip it then..
        }

        const UPGRADER_ENABLED = VarsController.isSet(`UPGRADE_${spawn.room.name}_ENABLED`);
        const spawnConfig = SettingsController.roomGet(spawn.room.name, 'SPAWNS');
        if (!spawnConfig) return;

        const roomCreeps = Object.values(Game.creeps).filter((creep) => creep.room.name === spawn.room.name);
        const spawnEntries = Object.entries(spawnConfig);

        for (let i: number = 0; i < spawnEntries.length; i++) {
            const value = spawnEntries[i];

            const role: CreepRole = value[0] as CreepRole;
            if (role === 'Upgrader' && !UPGRADER_ENABLED) continue;

            const levels: number[] = value[1] as number[];
            for (let indx: number = 0; indx < levels.length; indx++) {
                const level = indx + 1;
                const amountWanted = levels[indx];
                if (amountWanted <= 0) continue;

                const totalSpawned = this.countCreeps(roomCreeps, role, level);
                if (totalSpawned.length < amountWanted) {
                    const template = this.templates[role];
                    if (!template || !template[level]) continue;

                    const resp = spawn.spawnCreep(
                        template[level],
                        `${role.toUpperCase()}-${uniqueNamesGenerator({ dictionaries: [adjectives, animals], style: 'upperCase' })}`,
                        { memory: { role: role, level: level } },
                    );
                    if (resp == OK || resp == ERR_NOT_ENOUGH_ENERGY) return;
                }
            }
        }

        if (!sleepDisabled) {
            this.hasCheckedRoom[roomName] = true;
            console.log(`🩸 Done checking room '${roomName}' for spawns, nothing died so far.. going to sleep`);
        }
    }
}
