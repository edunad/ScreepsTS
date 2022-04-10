import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";

export interface MaintainerMemory extends CreepMemory {
    fixing: boolean;
}

export class Maintainer extends CakeCreep {
    public memory: MaintainerMemory;

    @register('Maintainer')
    private fixingMode(): void {
        const structs = this.room.find(FIND_STRUCTURES);
        const needsRepair = _.filter(structs, (structure) => structure.hits < structure.hitsMax / 4 * 3);
        if(!needsRepair.length) return CakeCreep.execute(this, 'goAFK', '😿');

        if(this.repair(needsRepair[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(needsRepair[0], {visualizePathStyle: {stroke: '#ffffff'}});
            this.say('🏃‍♀️');
        }
    }

    @register('Maintainer')
    private collectMode(): void {
        const structs = this.room.find(FIND_STRUCTURES);
        const powerStorage = _.filter(structs, (structure) =>
            (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_SPAWN) &&
            ((structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) != 0) ||
            (structure.structureType === STRUCTURE_SPAWN && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 200)));

        if(!powerStorage.length) return CakeCreep.execute(this, 'goAFK', '⚡?');
        if(this.withdraw(powerStorage[0], RESOURCE_ENERGY, this.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
            this.moveTo(powerStorage[0], {visualizePathStyle: {stroke: '#ffffff'}});
            this.say('🏃‍♀️');
        }
    }

    public dead() {
        console.log("Builder died! D:");
    }

    public run() {
        if(this.memory.fixing && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.fixing = false;
            this.say('⚡ harvest');
        }

        if(!this.memory.fixing && this.store.getFreeCapacity() == 0) {
            this.memory.fixing = true;
            this.say('🔧 fixing');
        }

        if(this.memory.fixing) CakeCreep.execute(this, 'fixingMode');
        else CakeCreep.execute(this, 'collectMode');
    }
}