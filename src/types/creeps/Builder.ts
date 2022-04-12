
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Traveler } from "libs/Traveler";
import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";

export interface BuilderMemory extends CreepMemory {
    building: boolean;
}

export class Builder extends CakeCreep {
    public memory: BuilderMemory;

    @register('Builder')
    private buildMode(): void {
        const targets = this.room.find(FIND_CONSTRUCTION_SITES);
        if(!targets.length) return CakeCreep.execute(this, 'goAFK', '🏢?');

        targets.sort((structure) => structure.structureType === STRUCTURE_EXTENSION ? -1 : 0);

        if(this.build(targets[0]) == ERR_NOT_IN_RANGE) {
            Traveler.travelTo(this, targets[0], {style: {stroke: '#ffffff'}});
            this.say('🏃‍♀️');
        }
    }

    public dead() {
        console.log("Builder died! D:");
    }

    public run() {
        if(this.memory.building && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.building = false;
            this.say('⚡');
        }

        if(!this.memory.building && this.store.getFreeCapacity() == 0) {
            this.memory.building = true;
            this.say('🚧');
        }

        if(this.memory.building) CakeCreep.execute(this, 'buildMode');
        else CakeCreep.execute(this, 'collectMode');
    }
}