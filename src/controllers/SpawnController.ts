
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
import { CreepChat } from "types/CreepChat";

interface CreepSpawnTemplateReq {
    energy?: number;
    level?: number;
    enemies?: number;
    sources?: number;
    extentions?: number;
    extentionsLess?: number;
    spawnerEnergy?: number;
    flagEnabled?: string;
    flagDisabled?: string;
}
interface CreepSpawnTemplate {
    name: string;
    role: CreepRole;
    body: BodyPartConstant[];
    req?: CreepSpawnTemplateReq;
    mem?: any;
    infinite?: boolean;
    infiniteNameParts?: string[];
}

const slaveBonuses: CreepSpawnTemplate[] = [];
slaveBonuses[CreepRole.Harvester] = [
    {
        req: {
            extentions: 5,
        },
        body: [WORK, WORK],
    },
    {
        req: {
            extentions: 12,
        },
        body: [WORK],
    }
];

slaveBonuses[CreepRole.Builder] = [{
    req: {
        extentions: 8,
        energy: 5000,
    },
    body: [WORK, CARRY, MOVE, MOVE],
}];
slaveBonuses[CreepRole.Karen] = [{
    req: {
        extentions: 8,
        energy: 4000,
    },
    body: [WORK, CARRY, MOVE, MOVE],
}];

const slaves: CreepSpawnTemplate[] = [
    {name: 'Karen', role: CreepRole.Karen, body: [WORK, CARRY, MOVE]},
    {name: 'Koren', role: CreepRole.Karen, body: [WORK, CARRY, CARRY, MOVE, MOVE], req: {energy: 4500}},
    {name: 'Kiren', role: CreepRole.Karen, body: [WORK, CARRY, CARRY, MOVE, MOVE], req: {extentions: 5}},

    {name: 'Mina', role: CreepRole.FighterMelee, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {enemies: 1}},
    //{name: 'Gumball', role: CreepRole.FighterMelee, body: [RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE], req: {enemies: 1}},
    {name: 'Aiko', role: CreepRole.FighterMelee, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {enemies: 1}},
    //{name: 'Feye', role: CreepRole.FighterMelee, body: [RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE], req: {enemies: 2}},
    {name: 'Kubus', role: CreepRole.FighterMelee, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {enemies: 2}},
    {name: 'Bobbie', role: CreepRole.FighterMelee, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {enemies: 3}},
    {name: 'Bobby', role: CreepRole.FighterMelee, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {enemies: 4}},

    {name: 'Bob', role: CreepRole.Harvester, mem: {sourceIndex: 0}, body: [WORK, WORK, CARRY, MOVE], req: {energy: 1, level: 2}},
    {name: 'Rob', role: CreepRole.Harvester, mem: {sourceIndex: 1}, body: [WORK, WORK, CARRY, MOVE], req: {energy: 1, level: 2, sources: 2}},

    {name: 'Harry', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {level: 2}},
    {name: 'Brom', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 1000}},
    {name: 'Edunand', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 1500}},
    {name: 'Jack', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 2500}},
    {name: 'Sploosh', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 4000}},
    {name: 'Dio', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 4000, extentionsLess: 8}},
    {name: 'Fob', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 4500, extentionsLess: 8}},
    {name: 'Gathilo', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 5000, extentionsLess: 8}},
    {name: 'Kate', role: CreepRole.Builder, body: [WORK, CARRY, MOVE], req: {flagDisabled: 'WAR', energy: 6000, extentionsLess: 8}},

    //{name: 'Derpy', role: CreepRole.Adventurer, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {energy: 5000, extentions: 8, level: 3}},
    //{name: 'Derpina', role: CreepRole.Adventurer, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {energy: 5000, extentions: 8, level: 3}},

    {name: 'BLOOD FOR THE BLOOD GOD', infinite: true, infiniteNameParts: ['🩸', '🔪', '👿', '🦷', '🪓'], role: CreepRole.Adventurer, body: [TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], req: {energy: 1000, extentions: 8, level: 3, flagEnabled: 'WAR'}},
]

const rooms: string[] = ['W6N1'];

export class SpawnController {
    private y: number = 0;

    private createFlag(room: Room, msg: string){
        //room.visual.text(msg, 0, this.y++, {color: '#FF0000', align: 'left'});
    }

    private checkReq(req: CreepSpawnTemplateReq, room: Room, roomDetails: CreepSpawnTemplateReq): boolean {
        if (typeof req.energy !== 'undefined' && roomDetails.energy < req.energy) return false;
        if (typeof req.sources !== 'undefined' && roomDetails.sources < req.sources) return false;
        if (typeof req.level !== 'undefined' && req.level > roomDetails.level) return false;
        if (typeof req.enemies !== 'undefined' && req.enemies > roomDetails.enemies) return false;
        if (typeof req.extentions !== 'undefined' && req.extentions > roomDetails.extentions) return false;
        if (typeof req.extentionsLess !== 'undefined' && req.extentionsLess <= roomDetails.extentions) return false;
        if (typeof req.flagEnabled !== 'undefined' && Game.flags[req.flagEnabled]?.color != COLOR_GREEN) return false;
        if (typeof req.flagDisabled !== 'undefined' && Game.flags[req.flagDisabled]?.color != COLOR_RED) return false;

        return true;
    }

    private getRoomReqs(room: Room): CreepSpawnTemplateReq {
        const targets = room.find(FIND_STRUCTURES);
        var energy = 0;
        for(var id in targets) {
            const target = targets[id];
            if (target.structureType !== STRUCTURE_CONTAINER && target.structureType !== STRUCTURE_STORAGE) continue;

            energy += target.store.getUsedCapacity(RESOURCE_ENERGY);
        }

        let availSpawner = 0;
        const exts = room.find(FIND_MY_STRUCTURES).filter((x) => x.structureType === STRUCTURE_EXTENSION || x.structureType == STRUCTURE_SPAWN);
        exts.forEach((e) => {
            if (!(e instanceof StructureExtension) && !(e instanceof StructureSpawn)) return;
            availSpawner += e.store.getUsedCapacity(RESOURCE_ENERGY);
        });

        return  {
            sources: room.find(FIND_SOURCES).length,
            enemies: room.find(FIND_HOSTILE_CREEPS).length + room.find(FIND_HOSTILE_STRUCTURES).length,
            extentions: exts.length,
            energy: energy,
            level: room.controller.level,
            spawnerEnergy: availSpawner,
        };
    }

    private costMapping: {[id: string]: number} = {
        work: 100,
        move: 50,
        tough: 10,
        carry: 50,
        attack: 80,
        ranged_attack: 150,
        heal: 250,
        claim: 600,
    };

    private getBuildCost(body: BodyPartConstant[]): number {
        let cost = 0;
        body.forEach((b) => {
            if (!this.costMapping[b]) {
                throwError(`Unknown body part '${b}'`);
                return;
            }

            cost += this.costMapping[b];
        });

        return cost;
    }

    public checkRespawns(): void {
        this.y = 1;

        rooms.forEach(roomName => {
            const room = Game.rooms[roomName];
            const roomReq = this.getRoomReqs(room);

            //room.visual.clear();
            this.createFlag(room, 'Creeps');

            let didSpawn = false;
            let lastRole = null;
            slaves.forEach((slave) => {
                let slaveName = `${slave.name}:${roomName}`;
                if (slave.infinite) {
                    slaveName = '';

                    while (slaveName.length <= 3 || Game.creeps[slaveName]) {
                        slaveName += slave.infiniteNameParts[Math.floor(Math.random() * slave.infiniteNameParts.length)];
                    }
                }

                if (lastRole !== slave.role) {
                    this.createFlag(room, `${slave.role}:`);
                    lastRole = slave.role;
                }

                if (Game.creeps[slaveName]) {
                    this.createFlag(room, `- ${slave.name}: ${CreepChat.idle}`);
                    return;
                }

                if (didSpawn) {
                    this.createFlag(room, `- ${slave.name}: ${CreepChat.idle}`);
                    return;
                }

                this.createFlag(room, `- ${slave.name}: ${CreepChat.needTask}`);

                if (slave.req && !this.checkReq(slave.req, room, roomReq)) return;
                let bodyParts = slave.body;
                if (slaveBonuses[slave.role]) {
                    slaveBonuses[slave.role].forEach((x: CreepSpawnTemplate) => {
                        if (this.checkReq(x.req, room, roomReq)) {
                            bodyParts = bodyParts.concat(x.body);
                        }
                    });
                }

                didSpawn = true;
                const spawns = room.find(FIND_MY_SPAWNS);
                if (spawns.length == 0) return;

                const costNeeded = this.getBuildCost(bodyParts);
                if (costNeeded > roomReq.spawnerEnergy) {
                    console.log(`Waiting to spawn ${slave.name}:${costNeeded}, got ${roomReq.spawnerEnergy}`);
                    return;
                }

                const code = spawns[0].spawnCreep(bodyParts, slaveName);
                switch(code) {
                    case OK:
                        const c = Game.creeps[slaveName];
                        c.memory.role = slave.role;

                        if (slave.mem) {
                            for (let key in slave.mem) {
                                c.memory[key] = slave.mem[key];
                            }
                        }

                        console.log(`Added ${slave.name}:${slave.role}: ${bodyParts}, cost ${costNeeded}`);
                        break;

                    case ERR_BUSY: break;
                    default:
                        console.log(`Failed to spawn ${slave.name}:${slave.role}`);
                        break;
                }
            });
        });
    }
}