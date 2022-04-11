import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { catchError } from "utils/ScreepsERR";
import { Traveler } from "utils/Traveler";
import { TravelToOptions } from "utils/TravelerInterfaces";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskWithdraw extends CreepTaskBase {
    private target: string;
    private amount: number;
    private travelOptions: TravelToOptions = {style: {color: '#00AAAA', lineStyle: 'dashed', opacity:.5}, ignoreCreeps: true, ignoreRoads: false};

    constructor(struct?: Structure, amount?: number) {
        super();
        if (struct) this.target = struct.id;
        if (amount) this.amount = amount;
    }

    public onTick(creep: CreepBase): boolean {
        const target: any = Game.getObjectById(this.target);
        if (!target) {
            creep.obj.say(CreepChat.error, true);
            return true;
        }

        const targetEnergy = target.store.getUsedCapacity(RESOURCE_ENERGY);
        if (typeof this.amount !== 'undefined' && targetEnergy < this.amount) {
            creep.obj.say(CreepChat.sadface, true);
            return true;
        }

        const did = catchError(() => creep.obj.withdraw(target, RESOURCE_ENERGY, Math.min(creep.obj.store.getFreeCapacity(RESOURCE_ENERGY), targetEnergy)));
        if (typeof did === 'undefined') {
            creep.obj.say(CreepChat.error + 'W1');
            return true;
        }

        if (did !== OK) {
            if(did == ERR_INVALID_TARGET) {
                creep.obj.say(CreepChat.sadface, true);
                return true;
            }

            if(did == ERR_NOT_IN_RANGE) {
                const moveret = Traveler.travelTo(creep.obj, target, this.travelOptions);
                creep.obj.say(moveret == OK ? CreepChat.moving : CreepChat.tired, true);
                return false;
            }

            if(did == ERR_FULL || did == ERR_NOT_ENOUGH_ENERGY) {
                creep.obj.say(CreepChat.done, true);
                return true;
            }

            creep.obj.say(`${CreepChat.error}:${did}:Withdraw`);
            return false;
        }

        creep.obj.say(CreepChat.busy, true);
        return true;
    }

    public serialize(): object {
        return {
            target: this.target,
            amount: this.amount
        };
    }

    public deserialize(data: any): void {
        this.target = data.target;
        this.amount = data.amount;
    }

    public getType(): CreepTask {
        return CreepTask.Withdraw;
    }
}