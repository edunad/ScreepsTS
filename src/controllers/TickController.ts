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
                const creep = tombstone.creep;
                if(!creep.my || Memory.creeps[creep.name] == null) return;

                __scripts[creep.memory.role].dead.bind(creep)();
                delete Memory.creeps[creep.name];
            });
        });
        // ---

        PowerPointsController.scan();
        SpawnController.run();

        // Tick creeps
        for(const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];
            if(!creep.memory.role) creep.memory.role = 'Harvester'; // Default

            if(creep.memory.sleepTick) {
                creep.memory.sleepTick -= 1;
                if (creep.memory.sleepTick <= 0) creep.memory.sleepTick = null;

                continue;
            }

            __scripts[creep.memory.role].run.bind(creep)();
        }
    }
}