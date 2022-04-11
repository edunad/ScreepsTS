import { SourceController } from "controllers/SourceController";
import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError } from "utils/ScreepsERR";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskHarvest extends CreepTaskBase {
    private target: string;
    private movePathVisual = {visualizePathStyle: {stroke: '#AA0000', opacity:.5}};

    constructor(source?: Source) {
        super();
        if (source) this.target = source.id;
    }

    public onTick(creep: CreepBase): boolean {
        const target: Source = Game.getObjectById(this.target);
        if (!target) {
            creep.obj.say(CreepChat.error);
            return true;
        }

        if (creep.obj.store.getFreeCapacity() == 0) {
            creep.obj.say(CreepChat.done);
            return true;
        }

        const dropped = target.room.find(FIND_DROPPED_RESOURCES, {filter: (d) => {return (d.resourceType == RESOURCE_ENERGY && d.pos.isEqualTo(creep.obj.pos))}});
        if (dropped.length > 0) dropped.forEach((d) => creep.obj.pickup(d));

        const did = catchError(() => creep.obj.harvest(target));
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

            creep.obj.say(`${CreepChat.error}:${did}:harvest`);
            return false;
        }

        creep.obj.say(CreepChat.busy);
        return false;
    }

    public onStart(creep: CreepBase) {
        const target: Source = Game.getObjectById(this.target);
        SourceController.addBusy(target);
    }

    public onEnd(creep: CreepBase) {
        const target: Source = Game.getObjectById(this.target);
        SourceController.removeBusy(target);
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
        return CreepTask.Harvest;
    }
}