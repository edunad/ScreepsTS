
export interface UpgraderMemory extends CreepMemory {
    upgrading: boolean;
}

export class Upgrader extends Creep {
    public memory: UpgraderMemory;

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
            if(this.room.controller.ticksToDowngrade <= 9000) {
                if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                this.moveTo(46, 19, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else {
            const sources = this.room.find(FIND_SOURCES);
            if(this.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                this.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
}