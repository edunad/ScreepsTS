import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { CreepStaticMiner } from "creeps/static_miner";
import { CreepDrone } from "creeps/drone";

// Extend screeps interfaces
declare global {
    interface Memory {
        uuid: number;
        // ....
    }

    interface CreepMemory {
        role: 'static_miner' | 'drone';
        // ....
    }
};

class DesiredCreep {
    public name: string;
    public role: string; //todo enum
    public initial_state: string;
    public body: BodyPartConstant[];
}

declare var module: any;
module.exports.loop = () => {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    const desired_creeps: DesiredCreep[] = [
        { name: 'Miner1', role: 'static_miner', initial_state: 'positioning', body: [MOVE, WORK, WORK] },
        { name: 'Drone1', role: 'drone', initial_state: 'grab_resources', body: [MOVE, MOVE, WORK, CARRY] },
    ]

    const spawn = Game.spawns["Spawn1"];

    for ( const creep of desired_creeps ) {
        const new_mem : any = { "state": creep.initial_state, "role": creep.role };
        spawn.spawnCreep(creep.body, creep.name, {memory: new_mem});
    }

    for ( const creep_name in Game.creeps ) {
        const creep = Game.creeps[creep_name];
        if (creep.memory.role == 'static_miner') {
            CreepStaticMiner.tick(creep);
        } else if (creep.memory.role == 'drone') {
            CreepDrone.tick(creep);
        }
    }
};
