import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

// Extend screeps interfaces
declare global {
    interface Memory {
        uuid: number;
        // ....
    }

    interface CreepMemory {
        role: 'Harvester' | 'Upgrader' | 'Builder';
        // ....
    }
};

// Main loop
declare var module: any;
module.exports.loop = () => {
   // DELETE OLD MEMORIES
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    // ---
};
