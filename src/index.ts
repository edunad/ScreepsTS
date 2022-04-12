import { CreepRole } from './controllers/SpawnController';
import { TickController } from './controllers/TickController';
import { TravelData } from 'libs/Traveler';

import './extensions/MathExtension';
import './extensions/StringExtension';
import './extensions/NumberExtension';

declare global {
    interface RoomMemory {
        avoid: number;
    }

    interface Memory {
        empire: any;
    }

    interface CreepMemory {
        role: CreepRole;
        level: number;

        // Sleep
        sleepTick?: number;
        // ---

        // Traveler
        _trav?: TravelData | any;
        _travel?: TravelData;
        // ---
    }

    interface PowerCreepMemory {
        role: CreepRole;
        // ....\
    }
}

declare var module: any;
module.exports.loop = () => TickController.run();

