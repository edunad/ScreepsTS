import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError } from "utils/ScreepsERR";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskRepair extends CreepTaskBase {
    private target: string;
    private movePathVisual = {visualizePathStyle: {stroke: '#AAAA00', opacity:.5}};

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

        if (target.hitsMax == target.hits || creep.obj.store.getUsedCapacity() == 0) {
            creep.obj.say(CreepChat.done);
            return true;
        }

        const did = catchError(() => creep.obj.repair(target));
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

            if(did == ERR_NOT_ENOUGH_RESOURCES) {
                creep.obj.say(CreepChat.done);
                return true;
            }

            creep.obj.say(`${CreepChat.error}:${did}:Repair`);
            return false;
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
        return CreepTask.Repair;
    }
}