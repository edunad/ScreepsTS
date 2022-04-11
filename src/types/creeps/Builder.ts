import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

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
            this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            this.say('🏃‍♀️');
        }
    }

    @register('Builder')
    private collectMode(): void {
        const structs = this.room.find(FIND_STRUCTURES);
        const powerStorage = _.filter(structs, (structure) =>
            (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_SPAWN) &&
            ((structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > this.store.getFreeCapacity()) ||
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
        if(this.memory.building && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.building = false;
            this.say('⚡ harvest');
        }

        if(!this.memory.building && this.store.getFreeCapacity() == 0) {
            this.memory.building = true;
            this.say('🚧 build');
        }

        if(this.memory.building) CakeCreep.execute(this, 'buildMode');
        else CakeCreep.execute(this, 'collectMode');
    }
}