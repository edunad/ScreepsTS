import { SourceController } from "controllers/SourceController";
import _ from "lodash";
import { CreepTaskHarvest } from "tasks/CreepTaskHarvest";
import { CreepTaskRegen } from "tasks/CreepTaskRegen";
import { CreepTaskTransfer } from "tasks/CreepTaskTransfer";
import { ResourceTypes } from "types/ResourceList";
import { CreepBase } from "./CreepBase";

export interface ExtractorMemory extends CreepMemory {
    target: string;
}

export class CreepExtractor extends CreepBase {
    public memory: ExtractorMemory;

    private findEnergySource(): void {
        var minerals = this.obj.room.find(FIND_MINERALS);
        if (minerals.length == 0) return;

        this.setTask(new CreepTaskHarvest(minerals[0]));
    }

    private findEnergyStorage(): void {
        const whitelist = [
            //STRUCTURE_LAB,
            STRUCTURE_TERMINAL,
        ];

        var targets = this.obj.room.find(FIND_STRUCTURES).filter((x: any) => whitelist.includes(x.structureType));
        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s));

        for (let i in ResourceTypes) {
            const amm = this.obj.store.getUsedCapacity(ResourceTypes[i]);
            if (amm > 0) {
                for(var id in targets) {
                    const target: any = targets[id];
                    if (target.store && target.store.getFreeCapacity(ResourceTypes[i]) == 0) continue;

                    this.setTask(new CreepTaskTransfer(target, ResourceTypes[i], amm));
                    return;
                }
            }
        }
    }

    public onTick(): void {
        if (!(this.getTask() instanceof CreepTaskRegen) && this.obj.ticksToLive <= 200) {
            this.setTask(new CreepTaskRegen());
        }

        super.onTick();
    }

    public onGetNextTask() {
        if(this.obj.store.getUsedCapacity() === 0) {
            this.findEnergySource();
            return;
        }

        this.findEnergyStorage();
    }
}
