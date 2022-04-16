import type { LoDashStatic } from 'lodash';
declare var _: LoDashStatic;

import { Colony } from 'colony';

// Extend screeps interfaces
declare global {
	interface Memory {
		uuid: number;
		// ....
	}

	interface CreepMemory {
		role: 'static_miner' | 'hauler' | 'worker';
		state: string;
		hive: string;
		// ....
	}

	interface SourceMemory {
		id: Id<Source>;
		minerName?: string;
		container?: Id<StructureContainer>;
	}

	interface SourcesMemory {
		[id: Id<Source>]: SourceMemory;
	}

	interface RoomMemory {
		sources?: SourcesMemory;
	}
}

class DesiredCreep {
	public name: string;
	public role: string; //todo enum
	public initial_state: string;
	public body: BodyPartConstant[];
}

declare var module: any;
module.exports.loop = () => {
	for (let name in Memory.creeps) {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}

	const colonyRooms: Room[] = [Game.rooms['W9N8']];

	colonyRooms.forEach((room) => {
		new Colony(room).run();
	});
};
