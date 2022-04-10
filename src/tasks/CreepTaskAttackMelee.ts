import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError } from "utils/ScreepsERR";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskAttackMelee extends CreepTaskBase {
    private target: string;
    private movePathVisual = {visualizePathStyle: {stroke: '#FF0000', opacity:.5}};

    constructor(target?: Structure|Creep) {
        super();
        if (target) this.target = target.id;
    }

    public onTick(creep: CreepBase): boolean {
        const target: any = Game.getObjectById(this.target);
        if (!target) {
            creep.obj.say(CreepChat.error);
            return true;
        }

        const did = catchError(() => creep.obj.attack(target));
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

            creep.obj.say(`${CreepChat.error}:${did}:Melee`);
            return false;
        }

        creep.obj.say(CreepChat.fightingMelee);
        return false;
    }

    public serialize(): object {
        return {
            target: this.target,
        };
    }

    public deserialize(data: any): void {
        this.target = data.target;
    }

    public getType(): CreepTask {
        return CreepTask.AttackMelee;
    }
}