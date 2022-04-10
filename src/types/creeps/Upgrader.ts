import { VarsController } from "controllers/VarsController";
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";

export interface UpgraderMemory extends CreepMemory {
    upgrading: boolean;
}

const UPGRADE_ENABLED: boolean = false;
export class Upgrader extends CakeCreep {
    public memory: UpgraderMemory;

    @register('Upgrader')
    private maintenanceMode(): void {
        if(this.room.controller.ticksToDowngrade > 9000) return CakeCreep.execute(this, 'goAFK', '⚡?');
        if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            this.say('🔧');
        }
    }

    @register('Upgrader')
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


    public run() {
        if(this.memory.upgrading && this.store[RESOURCE_ENERGY] <= 0) {
            this.memory.upgrading = false;
            this.say('🔄 harvest');
        }

        if(!this.memory.upgrading && this.store.getFreeCapacity() == 0) {
            this.memory.upgrading = true;
            this.say('⚡ upgrading');
        }

        if(this.memory.upgrading) {
            if(!VarsController.isSet('UPGRADE_ENABLED')) return CakeCreep.execute(this, 'maintenanceMode');
            return CakeCreep.execute(this, 'upgradeMode');
        }
        else return CakeCreep.execute(this, 'collectMode');
    }
}