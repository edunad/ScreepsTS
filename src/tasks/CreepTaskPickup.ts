import { SourceController } from "controllers/SourceController";
import { CreepBase } from "creeps/CreepBase";
import { TransformStream } from "stream/web";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { ResourceTypes } from "types/ResourceList";
import { catchError, throwError } from "utils/ScreepsERR";
import { Traveler } from "utils/Traveler";
import { TravelToOptions } from "utils/TravelerInterfaces";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskPickup extends CreepTaskBase {
    private target: string;
    private travelOptions: TravelToOptions = {style: {color: '#0000AA', lineStyle: 'dashed', opacity:.5}, ignoreCreeps: true, ignoreRoads: false};

    constructor(struct?: Resource|Tombstone|Ruin) {
        super();
        if (struct) this.target = struct.id;
    }

    public onTick(creep: CreepBase): boolean {
        const target: Resource|Tombstone = Game.getObjectById(this.target);
        if (!target) {
            creep.obj.say(CreepChat.error, true);
            return true;
        }

        let amount = creep.obj.store.getUsedCapacity();
        let did: number = 0;
        if (target instanceof Tombstone || target instanceof Ruin) {
            if (target.store.getUsedCapacity() == 0){
                creep.obj.say(CreepChat.done, true);
                return true;
            }

            for (let i in ResourceTypes) {
                const amm = target.store.getUsedCapacity(ResourceTypes[i]);
                if (amm > 0) did = creep.obj.withdraw(target, ResourceTypes[i], amm);
            }
        } else {
            did = creep.obj.pickup(target);
        }

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
        return CreepTask.Pickup;
    }
}