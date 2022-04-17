import { SourceController } from "controllers/SourceController";
import _ from "lodash";
import { CreepTaskBuild } from "tasks/CreepTaskBuild";
import { CreepTaskHarvest } from "tasks/CreepTaskHarvest";
import { CreepTaskRepair } from "tasks/CreepTaskRepair";
import { CreepTaskTransfer } from "tasks/CreepTaskTransfer";
import { CreepTaskWithdraw } from "tasks/CreepTaskWithdraw";
import { CreepChat } from "types/CreepChat";
import { CreepBase } from "./CreepBase";

export class CreepBuilder extends CreepBase {
    private findEnergySource(): void {
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

    private checkNeedsToFixController(): boolean {
        if (this.obj.room.controller.ticksToDowngrade >= 5000) return false;

        this.setTask(new CreepTaskTransfer(this.obj.room.controller));
        return true;
    };

    private checkNeedsToUpgrade(): boolean {
        if (this.obj.room.controller.level >= 8) return false;

        this.setTask(new CreepTaskTransfer(this.obj.room.controller));
        return true;
    };

    private checkNeedsToRepair(): boolean {
        var structures = this.obj.room.find(FIND_STRUCTURES);
        structures = _.sortBy(structures, s => this.obj.pos.getRangeTo(s))

        for(var id in structures) {
            const structure = structures[id];
            if (structure.structureType === 'controller') continue;
            if (structure.structureType === STRUCTURE_WALL && structure.hits > 30000) continue;
            if (structure.structureType === STRUCTURE_RAMPART && structure.hits > 50000) continue;
            if (structure.hitsMax / 4 * 3 < structure.hits) continue;

            this.setTask(new CreepTaskRepair(structure));
            return true;
        }

        return false;
    };

    private checkNeedsToBuild(): boolean {
        var targets: any = this.obj.room.find(FIND_CONSTRUCTION_SITES);

        // TEMP FILTER
        var fileredtargets = targets.filter((t) => t.structureType != STRUCTURE_RAMPART);
        if (fileredtargets.length > 0) targets = fileredtargets;

        if (targets.length == 0) return false;

        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s) - (s.progress / s.progressTotal * 20));
        this.setTask(new CreepTaskBuild(targets[0]));
        return true;
    };

    private checkNeedsEnergy(): boolean {
        if(this.obj.store.getUsedCapacity() != 0) return false;

        var structures = this.obj.room.find(FIND_STRUCTURES);
        structures = _.sortBy(structures, s => this.obj.pos.getRangeTo(s))

        for(var id in structures) {
            const structure = structures[id];
            if (structure.structureType !== STRUCTURE_CONTAINER && structure.structureType !== STRUCTURE_STORAGE && structure.structureType !== STRUCTURE_SPAWN && structure.structureType !== STRUCTURE_LINK) continue;
            const cap = structure.store.getUsedCapacity(RESOURCE_ENERGY);
            if (cap == 0) continue;
            if (structure.structureType === STRUCTURE_SPAWN && cap < 300) continue;

            const space = this.obj.store.getFreeCapacity(RESOURCE_ENERGY);
            if (cap < space) continue;

            this.setTask(new CreepTaskWithdraw(structure, space));
            return true;
        }

        //this.findEnergySource();
        return this.getTask() != null;
    };

    public onGetNextTask() {
        if (this.checkNeedsEnergy()) return;
        if (this.obj.store.getUsedCapacity() == 0 && !this.getTask()) return;

        if (this.checkNeedsToFixController()) return;
        if (this.checkNeedsToRepair()) return;
        if (this.checkNeedsToBuild()) return;
        if (this.checkNeedsToUpgrade()) return;

        this.obj.say(CreepChat.needTask, true);
    }
}