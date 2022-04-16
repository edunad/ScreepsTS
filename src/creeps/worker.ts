import { Colony } from 'colony';

function spend_resources_somewhere(colony: Colony, creep: Creep) {
	if (creep.room.controller.ticksToDowngrade < 10000) {
		creep.memory['state'] = 'charge_controller';
	} else if (Game.spawns['Spawn1'].store.getUsedCapacity(RESOURCE_ENERGY) < 100) {
		creep.memory['state'] = 'charge_spawn';
	} else if (colony.towers.some((tower) => tower.store.getFreeCapacity(RESOURCE_ENERGY) > 50)) {
		creep.memory['state'] = 'charge_tower';
	} else {
		// if nothing else to do, might as well charge the controller
		creep.memory['state'] = 'charge_controller';
	}
}

export class CreepWorker {
	static tick(colony: Colony, creep: Creep) {
		const state = creep.memory['state'];

		if (state == 'fetch_resources') {
			let energySource = colony.mainStorage ? colony.mainStorage : colony.spawn;

			if (creep.withdraw(energySource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(energySource);
			}

			if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
				spend_resources_somewhere(colony, creep);
			}
		}

		if (state == 'charge_controller') {
			const controller = creep.room.controller;
			if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(controller);
			}
		}
		if (state == 'charge_tower') {
			const tower = colony.towers.filter((t) => t.store.getFreeCapacity(RESOURCE_ENERGY) > 50)[0];
			if (tower) {
				if (creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(tower);
				}
			} else {
				spend_resources_somewhere(colony, creep);
			}
		}

		if (state == 'charge_spawn') {
			const spawn = colony.spawn;
			if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(spawn);
			}
		}

		if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			creep.memory['state'] = 'fetch_resources';
		}
	}
}
