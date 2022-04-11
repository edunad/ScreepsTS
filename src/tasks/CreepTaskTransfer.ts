import { SourceController } from "controllers/SourceController";
import { CreepBase } from "creeps/CreepBase";
import { TransformStream } from "stream/web";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError, throwError } from "utils/ScreepsERR";
import { Traveler } from "utils/Traveler";
import { TravelToOptions } from "utils/TravelerInterfaces";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskTransfer extends CreepTaskBase {
    private target: string;
    private travelOptions: TravelToOptions = {style: {color: '#0000AA', lineStyle: 'dashed', opacity:.5}, ignoreCreeps: true, ignoreRoads: false};

    constructor(struct?: Structure) {
        super();
        if (struct) this.target = struct.id;
    }

    public onTick(creep: CreepBase): boolean {
        const target: any = Game.getObjectById(this.target);
        if (!target) {
            creep.obj.say(CreepChat.error, true);
            return true;
        }

        let amount = creep.obj.store.getUsedCapacity(RESOURCE_ENERGY);
        if (target.store) {
            amount = Math.min(amount, target.store.getFreeCapacity(RESOURCE_ENERGY))
        }
        
        const did = catchError(() => creep.obj.transfer(target, RESOURCE_ENERGY, amount));
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
                creep.obj.say(moveret == OK ? CreepChat.moving : CreepChat.tired, true);
                return false;
            }

            if(did == ERR_FULL || did == ERR_NOT_ENOUGH_RESOURCES) {
                creep.obj.say(CreepChat.done, true);
                return true;
            }

            creep.obj.say(`${CreepChat.error}:${did}:Transfer`);
            return false;
        }

        if (creep.obj.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.obj.say(CreepChat.done, true);
            return true;
        }

        creep.obj.say(CreepChat.busy, true);
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