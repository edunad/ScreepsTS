import { SourceController } from "controllers/SourceController";
import { getHive } from "index";
import _ from "lodash";
import { CreepTaskHarvest } from "tasks/CreepTaskHarvest";
import { CreepTaskIdle } from "tasks/CreepTaskIdle";
import { CreepTaskTransfer } from "tasks/CreepTaskTransfer";
import { CreepTaskWithdraw } from "tasks/CreepTaskWithdraw";
import { CreepBuilder } from "./CreepBuilder";
import { CreepHarvester } from "./CreepHarvester";

export class CreepKaren extends CreepBuilder {
    private findEnergySource2(): void {
        var sources = this.obj.room.find(FIND_SOURCES);
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
            STRUCTURE_CONTAINER,
        ];

        var targets = this.obj.room.find(FIND_STRUCTURES);
        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s))
        const space = this.obj.store.getFreeCapacity(RESOURCE_ENERGY);

        whitelist.forEach((type) => {
            if (this.getTask()) return;
            
            for(var id in targets) {
                const target: any = targets[id];
                if (target.structureType !== type) continue;
                if (!target.store) continue;
                if (target.store.getUsedCapacity(RESOURCE_ENERGY) < space) continue;

                this.setTask(new CreepTaskWithdraw(target, space));
                break;
            }
        });

        if (!this.getTask() && getHive().creeps.filter(x => x instanceof CreepHarvester).length < this.obj.room.find(FIND_SOURCES).length) this.findEnergySource2();
    }

    private findSpawnerBuilding(): void {
        const whitelist = [
            STRUCTURE_EXTENSION,
            STRUCTURE_SPAWN,
            STRUCTURE_TOWER,
        ];

        var targets = this.obj.room.find(FIND_STRUCTURES);
        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s))

        var endTarget = null;
        whitelist.forEach((type) => {
            if (endTarget) return;

            for(var id in targets) {
                const target: any = targets[id];
                if (target.structureType !== type) continue;
                if (!target.store) continue;
                if (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) continue;
                if (target.structureType == STRUCTURE_SPAWN && target.store.getFreeCapacity(RESOURCE_ENERGY) < 75) continue;

                endTarget = target;
                this.setTask(new CreepTaskTransfer(target));
                break;
            }
        });
    }

    public onGetNextTask() {
        if(this.obj.store.getUsedCapacity() === 0) {
            this.findEnergyStorage();
            return;
        }

        this.findSpawnerBuilding();

        if (!this.getTask()) {
            super.onGetNextTask();
            if (!this.getTask()) this.setTask(new CreepTaskIdle(10));
        }
    }
}