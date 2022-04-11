import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { PowerPointsController } from "controllers/PowerPointsController";
import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";

export interface HarvesterMemory extends CreepMemory {
    sourceID?: string;
    storing: boolean;
}

export class Harvester extends CakeCreep {
    public memory: HarvesterMemory;

    @register('Harvester')
    private mineResource(): void {
        if(!CakeCreep.execute(this, 'registerHarvester')) return CakeCreep.execute(this, 'goAFK', '⚡?');

        const source = PowerPointsController.get(this.memory.sourceID);
        if(this.harvest(source.source) == ERR_NOT_IN_RANGE) {
            this.moveTo(source.source, {visualizePathStyle: {stroke: '#ffaa00'}});
            this.say("🏃‍♀️");
        }
    }

    @register('Harvester')
    private registerHarvester(say: string): boolean {
        if(this.memory.sourceID) return true;

        const source = PowerPointsController.getClosestAvaliableSource(this.pos);
        if(!source) return false;

        this.memory.sourceID = source.source.id;
        PowerPointsController.registerCreep(source.source.id, this);
        return true;
    }

    @register('Harvester')
    private storePower(): void {
        if(this.memory.sourceID) {
            PowerPointsController.unregisterCreep(this.memory.sourceID, this);
            this.memory.sourceID = null;
        }

        const targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_CONTAINER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        // Prioritize spawn
        const sortedTargets = _.sortBy(targets, (structure) =>
            structure.structureType === STRUCTURE_SPAWN ? -1 : structure.structureType === STRUCTURE_EXTENSION ? 0 : 1
        );

        if(!sortedTargets) return CakeCreep.execute(this, 'goAFK', '🔋?');
        if(this.transfer(sortedTargets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(sortedTargets[0], {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
            this.say("🏃‍♀️");
        }
    }

    public dead() {
        console.log("Harvester died! D:");
        PowerPointsController.unregisterCreep(this.memory.sourceID, this);
    }

    public run() {
        if(this.memory.storing && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.storing = false;
            this.say('🔋 store');
        }

        if(!this.memory.storing && this.store.getFreeCapacity() == 0) {
            this.memory.storing = true;
            this.say('⚡ harvest');
        }

        if(!this.memory.storing) return CakeCreep.execute(this, 'mineResource');
        else return CakeCreep.execute(this, 'storePower');
    }
}