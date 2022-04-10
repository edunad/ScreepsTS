
import _ from "lodash";
import { CreepBase } from "creeps/CreepBase";
import { CreepRole } from "types/CreepRole";
import { CreepBuilder } from "creeps/CreepBuilder";
import { throwError } from "utils/ScreepsERR";
import { CreepHarvester } from "creeps/CreepHarvester";
import { CreepTask } from "types/CreepTask";
import { CreepTaskHarvest } from "tasks/CreepTaskHarvest";
import { CreepTaskBase } from "tasks/CreepTask";
import { CreepTaskTransfer } from "tasks/CreepTaskTransfer";
import { getHive } from "index";

interface CreepSpawnTemplateReq {
    energy?: number;
    level?: number;
    enemies?: number;
    sources?: number;
}
interface CreepSpawnTemplate {
    name: string;
    role: CreepRole;
    body: BodyPartConstant[];
    req?: CreepSpawnTemplateReq;
}

const slaves: CreepSpawnTemplate[] = [
    {name: 'Karen', role: CreepRole.Karen, body: [WORK, CARRY, MOVE]},
    {name: 'Mina', role: CreepRole.FighterMelee, body: [ATTACK, ATTACK, TOUGH, MOVE], req: {enemies: 1}},
    {name: 'Gumball', role: CreepRole.FighterRanged, body: [RANGED_ATTACK, MOVE], req: {enemies: 1}},

    {name: 'Bob', role: CreepRole.Harvester, body: [WORK, WORK, CARRY, MOVE], req: {energy: 1, level: 2}},
    {name: 'Rob', role: CreepRole.Harvester, body: [WORK, WORK, CARRY, MOVE], req: {energy: 1, level: 2, sources: 2}},

    {name: 'Harry', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {level: 2}},
    {name: 'Brom', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {energy: 1000}},
    {name: 'Edunand', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {energy: 1500}},
    {name: 'Jack', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {energy: 2500}},
    {name: 'Sploosh', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {energy: 4000}},
    {name: 'Dio', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {energy: 4000}},
    {name: 'Fob', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {energy: 4500}},
]

const rooms: string[] = ['W6N1'];

export class SpawnController {
    public checkRespawns(): void {
        rooms.forEach(roomName => {
            const room = Game.rooms[roomName];
            let didSpawn = false;
            slaves.forEach((slave) => {
                const slaveName = `${slave.name}:${roomName}`;

                if (didSpawn) return;
                if (Game.creeps[slaveName]) return;

                if (slave.req) {
                    if (typeof slave.req.energy !== 'undefined') {
                        const targets = room.find(FIND_STRUCTURES);
                        var energy = 0;
                        for(var id in targets) {
                            const target = targets[id];
                            if (target.structureType !== STRUCTURE_CONTAINER) continue;

                            energy += target.store.getUsedCapacity(RESOURCE_ENERGY);
                        }


                        if (energy < slave.req.energy) return;
                    }

                    if (typeof slave.req.sources !== 'undefined' && room.find(FIND_SOURCES).length < slave.req.sources) {
                        return;
                    }

                    if (typeof slave.req.level !== 'undefined' && slave.req.level > room.controller.level) {
                        return;
                    }

                    if (typeof slave.req.enemies !== 'undefined' && slave.req.enemies >
                        (
                            room.find(FIND_HOSTILE_CREEPS).length +
                            room.find(FIND_HOSTILE_STRUCTURES).length
                        )) {
                        return;
                    }
                }

                didSpawn = true;
                const spawns = room.find(FIND_MY_SPAWNS);
                if (spawns.length == 0) return;

                const code = spawns[0].spawnCreep(slave.body, slaveName);
                switch(code) {
                    case OK:
                        const c = Game.creeps[slaveName];
                        c.memory.role = slave.role;

                        console.log(`Added ${slave.name}:${slave.role}`);
                        break;

                    default:
                        console.log(`Failed to spawn ${slave.name}:${slave.role}`);
                        break;
                }
            });
        });
    }
}