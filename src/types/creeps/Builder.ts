
export interface BuilderMemory extends CreepMemory {
    building: boolean;
}

export class Builder extends Creep {
    public memory: BuilderMemory;

    public run() {
        if(this.memory.building && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.building = false;
            this.say('🔄 harvest');
        }

        if(!this.memory.building && this.store.getFreeCapacity() == 0) {
            this.memory.building = true;
            this.say('🚧 build');
        }

        if(this.memory.building) {
            const targets = this.room.find(FIND_CONSTRUCTION_SITES);

            if(targets.length) {
                if(this.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        else {
            const sources = this.room.find(FIND_SOURCES);
            if(this.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                this.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
}