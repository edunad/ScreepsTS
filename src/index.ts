import { catchError } from './utils/ScreepsERR';

import { SpawnController, CreepRole } from './controllers/SpawnController';
import { TickController } from './controllers/TickController';


declare global {
    interface Memory {
        uuid: number;
        // ....
    }

    interface CreepMemory {
        role: CreepRole;
        // ....
    }
};

export const loop = catchError(() => {
    // DELETE OLD MEMORIES
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    // ---

    SpawnController.run();
    TickController.run();
});
