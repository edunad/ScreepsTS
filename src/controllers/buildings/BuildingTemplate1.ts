import { getHive } from "index";
import { CreepRole } from "types/CreepRole";
import { BuildingTemplateBase } from "./BuildingTemplateBase";

export class BuildingTemplate1 extends BuildingTemplateBase {
    public tick(): void {
        super.tick();
        const room = this.getRoom();
        if (room.find(FIND_CONSTRUCTION_SITES).length > 0) return;

        const structures = room.find(FIND_MY_STRUCTURES);
        if (structures.filter((x) => x.structureType == STRUCTURE_SPAWN).length == 0) {
            console.log(room.createConstructionSite(25, 25, STRUCTURE_SPAWN));
        }
    }

    public isDone(): boolean {
        return this.getRoom().find(FIND_CONSTRUCTION_SITES).length == 0;
    }

    public needsKaren(): boolean {
        return this.getRoom().find(FIND_MY_STRUCTURES).filter((x) => x.structureType == STRUCTURE_SPAWN).length == 0 &&
            getHive().creeps.filter((x) => x.obj.memory.role === CreepRole.Karen && x.obj.room.name === this.getRoom().name).length == 0;
    }
}
