import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError, throwError } from "utils/ScreepsERR";
import { Traveler } from "utils/Traveler";
import { TravelToOptions } from "utils/TravelerInterfaces";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskBuild extends CreepTaskBase {
    private target: string;
    private travelOptions: TravelToOptions = {style: {color: '#00AA00', lineStyle: 'dashed', opacity:.5}, ignoreCreeps: true, ignoreRoads: false};

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

        const did = catchError(() => creep.obj.build(target));
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

            if(did == ERR_NOT_ENOUGH_RESOURCES) {
                creep.obj.say(CreepChat.done, true);
                return true;
            }

            creep.obj.say(`${CreepChat.error}:${did}:Build`);
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
        return CreepTask.Build;
    }
}