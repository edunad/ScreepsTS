import { SourceController } from "controllers/SourceController";
import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError } from "utils/ScreepsERR";
import { Traveler } from "utils/Traveler";
import { TravelToOptions } from "utils/TravelerInterfaces";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskRegen extends CreepTaskBase {
    private travelOptions: TravelToOptions = {style: {color: '#AA0000', lineStyle: 'dashed', opacity:.5}, ignoreCreeps: true, ignoreRoads: false};

    constructor() {
        super();
    }

    public onTick(creep: CreepBase): boolean {
        const target: StructureSpawn = creep.obj.room.find(FIND_MY_STRUCTURES).filter((x) => x.structureType === STRUCTURE_SPAWN)[0] as StructureSpawn;
        if (!target) {
            creep.obj.say(CreepChat.error, true);
            return true;
        }

        if (creep.obj.ticksToLive >= 1499) {
            creep.obj.say(CreepChat.done, true);
            return true;
        }

        const did = catchError(() => target.renewCreep(creep.obj));
        if (typeof did === 'undefined') {
            creep.obj.say(CreepChat.error, true);
            return true;
        }

        if (did !== OK) {
            if(did == ERR_INVALID_TARGET) {
                creep.obj.say(CreepChat.error, true);
                return true;
            }

            if(did == ERR_TIRED) {
                creep.obj.say(CreepChat.tired, true);
                return false;
            }

            if(did == ERR_FULL) {
                creep.obj.say(CreepChat.done, true);
                return true;
            }

            if(did == ERR_NOT_IN_RANGE || did == ERR_BUSY) {
                const moveret = Traveler.travelTo(creep.obj, target, this.travelOptions);
                creep.obj.say(moveret == OK ? CreepChat.moving : CreepChat.tired);
                return false;
            }

            creep.obj.say(`${CreepChat.error}:${did}:regen`);
            return false;
        }

        creep.obj.say(CreepChat.busy, true);
        return false;
    }

    public serialize(): object {
        return {};
    }

    public deserialize(data: any): void {
    }

    public getType(): CreepTask {
        return CreepTask.Regen;
    }
}