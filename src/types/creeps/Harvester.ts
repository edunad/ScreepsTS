import { PowerPointsController } from "controllers/PowerPointsController";
import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";

export interface HarvesterMemory extends CreepMemory {
    sourceID?: string;
}

export class Harvester extends CakeCreep {
    public memory: HarvesterMemory;

    @register('Harvester')
    private mineResource(): void {
        if(!CakeCreep.execute(this, 'registerHarvester')) return CakeCreep.execute(this, 'goTakeAWalk', '⚡?');

        const source = PowerPointsController.get(this.memory.sourceID);
        if(this.harvest(source.source) == ERR_NOT_IN_RANGE) {
            this.moveTo(source.source, {visualizePathStyle: {stroke: '#ffaa00'}});
            this.say("🏃‍♀️");
        }
    }

    @register('Harvester')
    private registerHarvester(say: string): boolean {
        if(this.memory.sourceID) return true;

        const source = PowerPointsController.getAvaliableSource();
        if(!source) return false;

        this.memory.sourceID = source.source.id;
        PowerPointsController.registerCreep(source.source.id, this);
        return true;
    }

    @register('Harvester')
    private goTakeAWalk(say: string): void {
        this.moveTo(42, 26, {visualizePathStyle: {stroke: '#ffaa00'}});
        this.say(say);
    }

    @register('Harvester')
    private storePower(): void {
        if(this.memory.sourceID) {
            PowerPointsController.unregisterCreep(this.memory.sourceID, this);
            this.memory.sourceID = null;
        }

        const targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if(!targets) return CakeCreep.execute(this, 'goTakeAWalk', '🔋?');
        if(this.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            this.say("🏃‍♀️");
        }
    }

    public dead() {
        console.log("Harvester died! D:");
        PowerPointsController.unregisterCreep(this.memory.sourceID, this);
    }

    public run() {
        if(this.store.getFreeCapacity() > 0) return CakeCreep.execute(this, 'mineResource');
        else return CakeCreep.execute(this, 'storePower');
    }
}