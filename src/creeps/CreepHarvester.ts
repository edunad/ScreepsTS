import { SourceController } from "controllers/SourceController";
import _ from "lodash";
import { CreepTaskHarvest } from "tasks/CreepTaskHarvest";
import { CreepTaskTransfer } from "tasks/CreepTaskTransfer";
import { CreepBase } from "./CreepBase";

export interface HarvesterMemory extends CreepMemory {
    target: string;
}

export class CreepHarvester extends CreepBase {
    public memory: HarvesterMemory;

    private findEnergySource(): void {
        var sources = this.obj.room.find(FIND_SOURCES);
        const mem: any = this.obj.memory;
        if (typeof mem.sourceIndex !== 'undefined') {
            this.setTask(new CreepTaskHarvest(sources[mem.sourceIndex]));
            return;
        }

        sources = _.sortBy(sources, s => this.obj.pos.getRangeTo(s))
        for(var id in sources) {
            var source = sources[id];
            if (SourceController.isBusy(source)) {
                continue;
            }

            this.setTask(new CreepTaskHarvest(source));
        }
    }

    private findEnergyStorage(): void {
        const whitelist = [
            //STRUCTURE_EXTENSION,
            //STRUCTURE_SPAWN,
            //STRUCTURE_TOWER,
            STRUCTURE_STORAGE,
            STRUCTURE_CONTAINER,
            STRUCTURE_LINK,
            //STRUCTURE_CONTROLLER,
        ];

        var targets = this.obj.room.find(FIND_STRUCTURES).filter((x: any) => whitelist.includes(x.structureType));
        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s) + (s.structureType !== STRUCTURE_LINK ? 1 : 0));

        //var endTarget = null;
        //whitelist.forEach((type) => {
        //    if (endTarget) return;

            for(var id in targets) {
                const target: any = targets[id];
                if (target.store && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) continue;

        //        endTarget = target;
                this.setTask(new CreepTaskTransfer(target));
                break;
            }
        //});
    }

    public onGetNextTask() {
        if(this.obj.store.getUsedCapacity() === 0) {
            this.findEnergySource();
            return;
        }

        this.findEnergyStorage();
    }
}