import _ from "lodash";
import { CreepTaskIdle } from "tasks/CreepTaskIdle";
import { CreepTaskPickup } from "tasks/CreepTaskPickup";
import { CreepTaskTransfer } from "tasks/CreepTaskTransfer";
import { ResourceTypes } from "types/ResourceList";
import { CreepBase } from "./CreepBase";

export class CreepCollector extends CreepBase {
    private findEnergyStorage(): void {
        const whitelist = [
            STRUCTURE_STORAGE,
            STRUCTURE_CONTAINER,
            STRUCTURE_LINK,
        ];

        var targets = this.obj.room.find(FIND_STRUCTURES);
        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s))

        for(var id in targets) {
            const target: any = targets[id];
            if (!whitelist.includes(target.structureType)) continue;
            if (!target.store || target.store.getFreeCapacity() == 0) continue;

            for (let i in ResourceTypes) {
                const amm = this.obj.store.getUsedCapacity(ResourceTypes[i]);
                if (amm > 0) {
                    this.setTask(new CreepTaskTransfer(target, ResourceTypes[i], amm));
                    return;
                }
            }
        }
    }

    public onGetNextTask() {
        if (this.obj.store.getFreeCapacity() > 0) {
            const target = this.obj.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if(target) {
                this.setTask(new CreepTaskPickup(target));
                return;
            }

            if (this.obj.store.getUsedCapacity() == 0) {
                this.setTask(new CreepTaskIdle(5));
                return;
            }
        }

        this.findEnergyStorage();
    }
}
