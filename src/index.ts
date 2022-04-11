import { CreepRole } from './controllers/SpawnController';
import { TickController } from './controllers/TickController';

import './extensions/MathExtension';
import './extensions/StringExtension';
import './extensions/NumberExtension';

declare global {
    interface Memory {
        // ....
    }

    interface CreepMemory {
        role: CreepRole;

        // Sleep
        sleepTick?: number;
        // ....\
    }

    interface PowerCreepMemory {
        role: CreepRole;
        // ....\
    }
}

declare var module: any;
module.exports.loop = () => TickController.run();

