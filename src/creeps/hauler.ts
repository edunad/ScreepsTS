import { Colony } from 'colony';

export class CreepHauler {
	static tick(colony: Colony, creep: Creep) {
		const state = creep.memory['state'];

		if (state == 'fetch_resources') {
			const source_containers = colony.sources
				.map((source) => colony.room.memory.sources[source.id].container)
				.filter((containerId?: Id<StructureContainer>) => containerId !== null)
				.map((containerId) => Game.getObjectById(containerId))
				.filter((container: StructureContainer) => container.store.getUsedCapacity(RESOURCE_ENERGY) > 150);

			let source_container = null;
			if (source_containers.length > 0) {
				source_container = source_containers[0];
			} else {
				creep.say('zzz');
				return;
			}

			if (creep.withdraw(source_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source_container);
			}

			if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
				creep.memory['state'] = 'haul_to_storage';
			}
		}

		if (state == 'haul_to_storage') {
			let target: StructureContainer | StructureStorage | StructureSpawn = colony.mainStorage;
			if (!target) {
				target = colony.spawn;
			}
			if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}

		if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			creep.memory['state'] = 'fetch_resources';
		}
	}
}
