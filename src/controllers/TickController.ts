import { Builder } from "$creeps/Builder";
import { Harvester } from "$creeps/Harvester";
import { Upgrader } from "$creeps/Upgrader";

import { CreepRole } from "./SpawnController";

const __scripts: {[key in CreepRole]: () => void} = {
    'Builder' : Builder.prototype.run,
    'Harvester' : Harvester.prototype.run,
    'Upgrader' : Upgrader.prototype.run
};

export class TickController {
    public static run(): void {
        for(const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];
            __scripts[creep.memory.role].bind(creep)();
        }
    }
}