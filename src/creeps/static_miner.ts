import { Colony } from 'colony';
import { moveCursor } from 'readline';

export class CreepStaticMiner {
	static tick(colony: Colony, creep: Creep) {
		const state = creep.memory['state'];
		const source = colony.sources.filter((s) => colony.room.memory.sources[s.id].minerName == creep.name)[0];
		const sourceMem = colony.room.memory.sources[source.id];
		if (state == 'positioning') {
			if (creep.pos.getRangeTo(source) == 1) {
				creep.memory['state'] = 'setting_up';
			} else {
				creep.moveTo(source);
			}
		}
		if (state == 'setting_up') {
			if (creep.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.getActiveBodyparts(WORK) * 2) {
				creep.harvest(source);
				return;
			}
			if (!sourceMem.container) {
				const constructionSites = Object.values(Game.constructionSites).filter(
					(site) => site.pos.isEqualTo(creep.pos) && site.structureType == STRUCTURE_CONTAINER,
				);
				const containers = colony.room
					.find(FIND_STRUCTURES)
					.filter(
						(structure) => structure.pos.isEqualTo(creep.pos) && structure.structureType == STRUCTURE_CONTAINER,
					) as StructureContainer[];
				if (containers.length > 0) {
					sourceMem.container = containers[0].id;
				} else {
					if (constructionSites.length == 0) {
						colony.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
					}
					const constructionSite = Object.values(Game.constructionSites).filter(
						(site) => site.pos.isEqualTo(creep.pos) && site.structureType == STRUCTURE_CONTAINER,
					)[0];
					creep.build(constructionSite);
				}
			} else {
				const container = Game.getObjectById(sourceMem.container);
				if (container.hits < container.hitsMax) {
					creep.repair(container);
				} else {
					creep.memory['state'] = 'mining';
				}
			}
		}
		if (state == 'mining') {
			creep.harvest(source);
		}
	}
}
