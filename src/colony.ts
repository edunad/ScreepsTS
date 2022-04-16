import { CreepWorker } from 'creeps/worker';
import { CreepStaticMiner } from 'creeps/static_miner';
import { Age } from 'enums/age';
import { CreepHauler } from 'creeps/hauler';

export class Colony {
	public room: Room;
	public age: Age;
	public mainStorage?: StructureContainer | StructureStorage;
	public spawn: StructureSpawn;
	public sources: Source[];
	public creeps: Creep[];

	constructor(room: Room) {
		this.room = room;
	}

	findSources() {
		if (typeof this.room.memory.sources === 'undefined' || Object.values(this.room.memory.sources).length < 2) {
			console.log('Finding sources for room %s', this.room.name);
			this.room.memory.sources = {};
			this.room.find(FIND_SOURCES).forEach((source: Source) => {
				this.room.memory.sources[source.id] = {
					id: source.id,
				};
			});
		}
		this.sources = Object.values(this.room.memory.sources).map((source: SourceMemory) => Game.getObjectById(source.id));
	}

	findSpawn() {
		this.spawn = this.room.find(FIND_MY_SPAWNS)[0];
	}

	findMainStorage() {
		const consideredStrucureTypes: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];

		this.mainStorage = this.spawn.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: (structure: Structure) => consideredStrucureTypes.includes(structure.structureType),
		}) as StructureContainer | StructureStorage;
	}

	findCreeps() {
		this.creeps = Object.values(Game.creeps).filter((creep: Creep) => creep.memory.hive == this.room.name);
	}

	determineAge() {
		// single spawn with no extensions is always bronze age
		if (this.room.energyCapacityAvailable == 300) {
			this.age = Age.Bronze;
		}

		this.age = Age.Bronze;
	}

	runSources() {
		this.sources.forEach((source: Source) => {
			let sourceMem = this.room.memory.sources[source.id];
			// if the miner for this source recently died, remove the name from the source
			if (sourceMem.minerName) {
				if (!this.creeps.find((creep) => creep.name == sourceMem.minerName)) {
					delete sourceMem.minerName;
				}
			}
			if (!sourceMem.minerName) {
				const newMinerName = 'miner' + '-' + Game.time;
				const minerSpawnResult = this.spawn.spawnCreep([MOVE, CARRY, WORK, WORK], newMinerName, {
					memory: { role: 'static_miner', state: 'positioning', hive: this.room.name },
				});

				if (minerSpawnResult == OK) {
					sourceMem.minerName = newMinerName;
				}
			}
		});
	}

	runSpawner() {
		if (this.creeps.filter((creep) => creep.memory.role == 'hauler').length < this.requiredNumberOfHaulers()) {
			this.spawn.spawnCreep([MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], undefined, {
				memory: { role: 'hauler', state: 'fetch_resources', hive: this.room.name },
			});
		}

		if (this.creeps.filter((creep) => creep.memory.role == 'worker').length < this.requiredNumberOfWorkers()) {
			this.spawn.spawnCreep([MOVE, MOVE, CARRY, WORK], undefined, {
				memory: { role: 'worker', state: 'fetch_resources', hive: this.room.name },
			});
		}
	}

	requiredNumberOfHaulers() {
		return 1;
	}

	requiredNumberOfWorkers() {
		return 2;
	}

	run() {
		this.findSources();
		this.findSpawn();
		this.findMainStorage();
		this.findCreeps();
		this.determineAge();

		this.runSources();

		this.creeps.forEach((creep: Creep) => {
			if (creep.memory.role == 'static_miner') {
				CreepStaticMiner.tick(this, creep);
			} else if (creep.memory.role == 'hauler') {
				CreepHauler.tick(this, creep);
			} else if (creep.memory.role == 'worker') {
				CreepWorker.tick(this, creep);
			}
		});
	}
}
