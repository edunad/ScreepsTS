
import _ from "lodash";
import { CreepBase } from "creeps/CreepBase";
import { CreepRole } from "types/CreepRole";
import { CreepBuilder } from "creeps/CreepBuilder";
import { catchError, throwError } from "utils/ScreepsERR";
import { CreepHarvester } from "creeps/CreepHarvester";
import { CreepTask } from "types/CreepTask";
import { CreepTaskHarvest } from "tasks/CreepTaskHarvest";
import { CreepTaskBase } from "tasks/CreepTask";
import { CreepTaskTransfer } from "tasks/CreepTaskTransfer";
import { SpawnController } from "./SpawnController";
import { CreepTaskBuild } from "tasks/CreepTaskBuild";
import { CreepTaskWithdraw } from "tasks/CreepTaskWithdraw";
import { CreepTaskRepair } from "tasks/CreepTaskRepair";
import { CreepKaren } from "creeps/CreepKaren";
import { CreepChat } from "types/CreepChat";
import { CreepTaskIdle } from "tasks/CreepTaskIdle";
import { CreepFighterMelee } from "creeps/CreepFighterMelee";
import { CreepTaskAttackMelee } from "tasks/CreepTaskAttackMelee";
import { CreepFighterRanged } from "creeps/CreepFighterRanged";
import { CreepTaskAttackRanged } from "tasks/CreepTaskAttackRanged";
import { CreepAdventurer } from "creeps/CreepAdventurer";
import { CreepTaskMove } from "tasks/CreepTaskMove";
import { CreepTaskSleep } from "tasks/CreepTaskSleep";

export class HiveController {
    public creeps: CreepBase[] = [];
    public spawner: SpawnController = new SpawnController();

    public tick(): void {
        for(let name in Memory.creeps) {
            const creep = Game.creeps[name];
            if(creep && this.creeps.find((x) => x.name == name) == null) {
                this.registerCreep(creep);
            }
        }

        for (let i = 0; i < this.creeps.length; i++) {
            const c = this.creeps[i];
            c.obj = Game.getObjectById(c.id);

            if (c.obj instanceof Tombstone) {
                c.obj = c.obj.creep as Creep;
            }

            if (!c.obj) {
                if (!c.isDead()) {
                    console.log(`${c.name} got tombstoned`);
                    catchError(() => {
                        c.onDeath();
                    });
                }

                this.creeps.splice(i, 1);
                i--;
                continue;
            }

            catchError(() => {
                c.onTick();
            });

            if (c.obj.ticksToLive === 1) {
                console.log(`${c.name} will die next tick`);
                catchError(() => {
                    if (!c.isDead()) c.onDeath();
                });

                this.creeps.splice(i, 1);
                i--;
            }
        };

        catchError(() => {
            this.spawner.checkRespawns();
        });

        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            const structs = room.find(FIND_MY_STRUCTURES).filter((x) => x.structureType == STRUCTURE_TOWER);
            if (structs.length == 0) continue;

            const enemies = room.find(FIND_HOSTILE_CREEPS);
            const allies = room.find(FIND_MY_CREEPS).filter((c) => c.hits < c.hitsMax);

            structs.forEach((s) => {
                if (!(s instanceof StructureTower)) return;

                if (enemies.length == 0) {
                    if (allies.length > 0) {
                        const closest = _.sortBy(allies, s => s.pos.getRangeTo(s));
                        s.heal(closest[0]);
                    }

                    return;
                }

                const closest = _.sortBy(enemies, s => s.pos.getRangeTo(s));
                s.attack(closest[0]);
            });
        }
    }

    public registerCreep(creep: Creep): void {
        let wrapper: CreepBase = null;
        switch (creep.memory.role) {
            case CreepRole.Harvester: wrapper = new CreepHarvester(creep); break;
            case CreepRole.Builder: wrapper = new CreepBuilder(creep); break;
            case CreepRole.Karen: wrapper = new CreepKaren(creep); break;
            case CreepRole.FighterMelee: wrapper = new CreepFighterMelee(creep); break;
            case CreepRole.FighterRanged: wrapper = new CreepFighterRanged(creep); break;
            case CreepRole.Adventurer: wrapper = new CreepAdventurer(creep); break;
        }

        if (!wrapper) {
            creep.say(CreepChat.error, true);
            throwError(`${creep.name}:${creep.memory.role} has no role :(`);
            return;
        }

        if (creep.memory.taskData) {
            let task: CreepTaskBase;
            switch (creep.memory.taskData.__type) {
                case CreepTask.Harvest: task = new CreepTaskHarvest(); break;
                case CreepTask.Transfer: task = new CreepTaskTransfer(); break;
                case CreepTask.Build: task = new CreepTaskBuild(); break;
                case CreepTask.Repair: task = new CreepTaskRepair(); break;
                case CreepTask.Withdraw: task = new CreepTaskWithdraw(); break;
                case CreepTask.Idle: task = new CreepTaskIdle(); break;
                case CreepTask.AttackMelee: task = new CreepTaskAttackMelee(); break;
                case CreepTask.AttackRanged: task = new CreepTaskAttackRanged(); break;
                case CreepTask.Move: task = new CreepTaskMove(); break;
                case CreepTask.Sleep: task = new CreepTaskSleep(); break;
            }

            if (task) {
                task.deserialize(creep.memory.taskData);
                wrapper.setTask(task);
            }
        }

        console.log(`Registered ${creep.name}:${creep.memory.role}`);
        this.creeps.push(wrapper);
    }

    public init(): void {
        this.creeps.forEach((c) => {
            catchError(() => {
                c.onDeath();
            });
        });

        this.creeps = [];

        for(const name in Game.creeps) {
            this.registerCreep(Game.creeps[name]);
        }
    }

    public cancelTask(creepName: string) {
        let found = false;
        this.creeps.forEach((c) => {
            if (c.name.startsWith(creepName)) {
                c.setTask(null);
                console.log('Done: ' + c.name);

                found = true;
            }
        })

        if (!found) console.log('failed :(');
    }

    public cancelTaskByRole(role: string) {
        let found = false;
        this.creeps.forEach((c) => {
            if (c.obj.memory.role.toLowerCase() == role.toLowerCase()) {
                c.setTask(null);
                console.log('Done: ' + c.name);

                found = true;
            }
        })

        if (!found) console.log('failed :(');
    }
}
