import { Builder } from "$creeps/Builder";
import { Harvester } from "$creeps/Harvester";
import { Upgrader } from "$creeps/Upgrader";
import { Maintainer } from "$creeps/Maintainer";

import { SpawnController, CreepRole } from './SpawnController';
import { PowerPointsController } from './PowerPointsController';

const __scripts: {[key in CreepRole]: any} = {
    'Builder' : Builder.prototype,
    'Harvester' : Harvester.prototype,
    'Upgrader' : Upgrader.prototype,
    'Maintainer': Maintainer.prototype
};

export class TickController {
    public static run(): void {
        // DELETE OLD MEMORIES
        Object.keys(Game.rooms).forEach((id: string) => {
            Game.rooms[id].find(FIND_TOMBSTONES).forEach((tombstone) => {
                if(tombstone.creep.my && Memory.creeps[tombstone.creep.name]) {
                    __scripts[tombstone.creep.memory.role].dead.bind(tombstone.creep)();
                    delete Memory.creeps[tombstone.creep.name];
                }
            });
        });
        // ---

        PowerPointsController.scan();
        SpawnController.run();

        // Tick creeps
        for(const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];
            if(creep.memory.lastDeadTickCheck) {
                creep.memory.lastDeadTickCheck -= 1;
                if (creep.memory.lastDeadTickCheck <= 0) creep.memory.lastDeadTickCheck = null;

                continue;
            }

            __scripts[creep.memory.role].run.bind(creep)();
        }
    }
}