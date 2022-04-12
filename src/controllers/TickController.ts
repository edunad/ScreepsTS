import { Builder } from "$creeps/Builder";
import { Harvester } from "$creeps/Harvester";
import { Upgrader } from "$creeps/Upgrader";
import { Maintainer } from "$creeps/Maintainer";
import { Attacker } from "$creeps/Attacker";

import { Tower } from "$structs/Tower";

import { SpawnController, CreepRole } from './SpawnController';
import { PowerPointsController } from './PowerPointsController';


const __scripts: {[key in CreepRole]: any} = {
    'Builder' : Builder.prototype,
    'Harvester' : Harvester.prototype,
    'Upgrader' : Upgrader.prototype,
    'Maintainer': Maintainer.prototype,
    'Attacker': Attacker.prototype
};

export type SCRIPTED_STRUCTURE = STRUCTURE_TOWER;
const __struct_scripts: {[key in SCRIPTED_STRUCTURE]: any} = {
    'tower' : Tower.prototype
};

export class TickController {
    public static run(): void {
        // DELETE OLD MEMORIES
        Object.keys(Game.rooms).forEach((id: string) => {
            Game.rooms[id].find(FIND_TOMBSTONES).forEach((tombstone) => {
                const creep = tombstone.creep;
                if(!creep.my || Memory.creeps[creep.name] == null) return;
                // Alert creep
                __scripts[creep.memory.role].dead.bind(creep)();

                // Something died, enable spawn
                SpawnController.scanRoom(id);

                // Delete memory
                delete Memory.creeps[creep.name];
            });
        });
        // ---

        PowerPointsController.scan();
        SpawnController.run();

        // Tick creeps ---
        for(const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];

            // Defaults ---
            if(!creep.memory.role) creep.memory.role = 'Harvester';
            if(!creep.memory.level) creep.memory.level = 1;
            // -----

            // Sleep
            if(creep.memory.sleepTick) {
                creep.memory.sleepTick -= 1;
                if (creep.memory.sleepTick <= 0) creep.memory.sleepTick = null;

                creep.say('💤', true);
                continue;
            }
            // -----

            // Fatigue
            if(creep.fatigue > 0){
                creep.say('😓', true);
                continue;
            }
            // -----

            // Run
            __scripts[creep.memory.role].run.bind(creep)();
            // -----
        }

        // Tick structures
        for(const name in Game.structures) {
            const struct = Game.structures[name];
            __struct_scripts[struct.structureType]?.run.bind(struct)();
        }
    }
}