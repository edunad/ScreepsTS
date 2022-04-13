function spend_resources_somewhere(creep: Creep) {
	if (creep.room.controller.ticksToDowngrade < 10000) {
		creep.memory["state"] = "charge_controller";
	} else if (Game.spawns["Spawn1"].store.getUsedCapacity(RESOURCE_ENERGY) < 250) {
		creep.memory["state"] = "charge_spawn";
	} else {
		// if nothing else to do, might as well charge the controller
		creep.memory["state"] = "charge_controller";
	}
}

export class CreepDrone {
	static tick(creep: Creep) {
		const state = creep.memory["state"];

		if (state == "grab_resources") {
			const ground_energies = creep.room.find(FIND_DROPPED_RESOURCES).filter((resource) => resource.resourceType == RESOURCE_ENERGY);

			if (ground_energies.length > 0 ) {
				const ground_energy = ground_energies[0];
				if (creep.pickup(ground_energy) == ERR_NOT_IN_RANGE) {
					creep.moveTo(ground_energy);
				}
			}

			if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
				spend_resources_somewhere(creep);
			}
		}

		if (state == "charge_controller") {
			const controller = creep.room.controller;
			if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(controller);
			}
		}

		if (state == "charge_spawn") {
			const spawn = Game.spawns["Spawn1"];
			if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(spawn);
			}
		}
	}
}