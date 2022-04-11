import { SourceController } from "controllers/SourceController";
import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError } from "utils/ScreepsERR";
import { Traveler } from "utils/Traveler";
import { TravelToOptions } from "utils/TravelerInterfaces";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskHarvest extends CreepTaskBase {
    private target: string;
    private travelOptions: TravelToOptions = {style: {color: '#AA0000', lineStyle: 'dashed', opacity:.5}, ignoreCreeps: true, ignoreRoads: false};

    constructor(source?: Source) {
        super();
        if (source) this.target = source.id;
    }

    public onTick(creep: CreepBase): boolean {
        const target: Source = Game.getObjectById(this.target);
        if (!target) {
            creep.obj.say(CreepChat.error, true);
            return true;
        }

        if (creep.obj.store.getFreeCapacity() == 0) {
            creep.obj.say(CreepChat.done, true);
            return true;
        }

        const dropped = target.room.find(FIND_DROPPED_RESOURCES, {filter: (d) => {return (d.resourceType == RESOURCE_ENERGY && d.pos.isEqualTo(creep.obj.pos))}});
        if (dropped.length > 0) dropped.forEach((d) => creep.obj.pickup(d));

        const did = catchError(() => creep.obj.harvest(target));
        if (typeof did === 'undefined') {
            creep.obj.say(CreepChat.error, true);
            return true;
        }

        if (did !== OK) {
            if(did == ERR_INVALID_TARGET) {
                creep.obj.say(CreepChat.error, true);
                return true;
            }

            if(did == ERR_NOT_IN_RANGE) {
                const moveret = Traveler.travelTo(creep.obj, target, this.travelOptions);
                creep.obj.say(moveret == OK ? CreepChat.moving : CreepChat.tired);
                return false;
            }

            creep.obj.say(`${CreepChat.error}:${did}:harvest`);
            return false;
        }

        creep.obj.say(CreepChat.busy, true);
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