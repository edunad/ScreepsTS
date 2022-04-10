import { SourceController } from "controllers/SourceController";
import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError, throwError } from "utils/ScreepsERR";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskTransfer extends CreepTaskBase {
    private target: string;
    private movePathVisual = {visualizePathStyle: {stroke: '#0000AA', opacity:.5}};

    constructor(struct?: Structure) {
        super();
        if (struct) this.target = struct.id;
    }

    public onTick(creep: CreepBase): boolean {
        const target: any = Game.getObjectById(this.target);
        if (!target) {
            creep.obj.say(CreepChat.error);
            return true;
        }

        let amount = creep.obj.store.getUsedCapacity(RESOURCE_ENERGY);
        if (target.store) {
            amount = Math.min(amount, target.store.getFreeCapacity(RESOURCE_ENERGY))
        }
        
        const did = catchError(() => creep.obj.transfer(target, RESOURCE_ENERGY, amount));
        if (typeof did === 'undefined') {
            creep.obj.say(CreepChat.error);
            return true;
        }

        if (did !== OK) {
            if(did == ERR_INVALID_TARGET) {
                creep.obj.say(CreepChat.error);
                return true;
            }

            if(did == ERR_NOT_IN_RANGE) {
                creep.obj.moveTo(target, this.movePathVisual);
                creep.obj.say(CreepChat.moving);
                return false;
            }

            if(did == ERR_FULL || did == ERR_NOT_ENOUGH_RESOURCES) {
                creep.obj.say(CreepChat.done);
                return true;
            }

            creep.obj.say(`${CreepChat.error}:${did}:Transfer`);
            return false;
        }

        if (creep.obj.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.obj.say(CreepChat.done);
            return true;
        }

        creep.obj.say(CreepChat.busy);
        return false;
    }

    public serialize(): object {
        return {
            target: this.target
        };
    }

    public deserialize(data: any): void {
        this.target = data.target;
    }

    public getType(): CreepTask {
        return CreepTask.Transfer;
    }
}