export class CreepStaticMiner {
	static tick = (creep: Creep) => {
		const state = creep.memory["state"];
		const source = Game.getObjectById("088407718c7f377") as Source;
		if (state == "positioning") {
			if (creep.pos.getRangeTo(source) == 1) {
				creep.memory["state"] = "mining";
			} else {
				creep.moveTo(source);
			}
		} else if (state == "mining") {
			creep.harvest(source);
		}
	}
}