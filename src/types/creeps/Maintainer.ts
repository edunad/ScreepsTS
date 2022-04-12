
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Traveler } from "libs/Traveler";

import { VarsController } from "controllers/VarsController";

import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";
import { SettingsController } from "controllers/SettingsController";

export interface MaintainerMemory extends CreepMemory {
    fixing: boolean;
}

export class Maintainer extends CakeCreep {
    public memory: MaintainerMemory;
    public static maintenanceControllerLevels: {[level: number]: number} = {
        1: 0,
        2: 9000,
        3: 19000
    };

    @register('Maintainer')
    private maintenanceMode(): void {
        const structs = this.room.find(FIND_STRUCTURES);

        // Check towers
        const towers: StructureTower[] = structs.filter((structure) =>
            structure.structureType === STRUCTURE_TOWER &&
            structure.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) as StructureTower[];

        if(towers.length) {
            const towerTrf = this.transfer(towers[0], RESOURCE_ENERGY);
            if(towerTrf == ERR_NOT_IN_RANGE) {
                Traveler.travelTo(this, towers[0], {style: {stroke: '#ffffff'}});
                this.say('🏃‍♀️');
                return;
            } else if(towerTrf == OK) return;
        }

        // Check controller
        const controller = this.room.controller;
        if(controller.ticksToDowngrade <= (Maintainer.maintenanceControllerLevels[controller.level] || 0)) {
            const cont = this.upgradeController(controller);
            if(cont == ERR_NOT_IN_RANGE) {
                Traveler.travelTo(this, controller, {style: {stroke: '#ffffff'}});
                this.say('🏃‍♀️');
                return;
            } else if(cont == OK) return;
        }

        // Repair stuff
        const maxWall = SettingsController.get(this.room.name, 'WALL_MAX_SPEND', 10000);
        const needsRepair = _.filter(structs, (structure) => structure.structureType != STRUCTURE_WALL ? structure.hits < structure.hitsMax / 1.1 : structure.hits < maxWall);

        if(!needsRepair.length) {
            const UPGRADER_ENABLED = VarsController.isSet(`UPGRADE_${this.room.name}_ENABLED`);
            if(!UPGRADER_ENABLED) return CakeCreep.execute(this, 'goAFK', '😿');

            return CakeCreep.executeSpecial(this, 'Upgrader', 'upgradeMode');
        } else {
            if(this.repair(needsRepair[0]) == ERR_NOT_IN_RANGE) {
                Traveler.travelTo(this, needsRepair[0], {style: {stroke: '#ffffff'}});
                this.say('🏃‍♀️');
            }
        }
    }

    public dead() {
        console.log("Maintainer died! D:");
    }

    public run() {
        if(this.memory.fixing && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.fixing = false;
            this.say('⚡');
        }

        if(!this.memory.fixing && this.store.getFreeCapacity() == 0) {
            this.memory.fixing = true;
            this.say('🔧');
        }

        if(this.memory.fixing) CakeCreep.execute(this, 'maintenanceMode');
        else CakeCreep.execute(this, 'collectMode');
    }
}