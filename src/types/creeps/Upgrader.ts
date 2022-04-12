
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Traveler } from "libs/Traveler";
import { VarsController } from "controllers/VarsController";

import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";

export interface UpgraderMemory extends CreepMemory {
    upgrading: boolean;
}

export class Upgrader extends CakeCreep {
    public memory: UpgraderMemory;

    @register('Upgrader')
    private upgradeMode(): void {
        const controller = this.room.controller;

        if(this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            Traveler.travelTo(this, controller, {style: {stroke: '#ffffff'}});
            this.say('🔧');
        }
    }

    public dead() {
        console.log("Upgrader died! D:");
    }

    public run() {
        if(!VarsController.isSet(`UPGRADE_${this.room.name}_ENABLED`)) return;

        if(this.memory.upgrading && this.store[RESOURCE_ENERGY] <= 0) {
            this.memory.upgrading = false;
            this.say('🔄');
        }

        if(!this.memory.upgrading && this.store.getFreeCapacity() == 0) {
            this.memory.upgrading = true;
            this.say('⚡');
        }

        if(this.memory.upgrading) return CakeCreep.execute(this, 'upgradeMode');
        else return CakeCreep.execute(this, 'collectMode');
    }
}