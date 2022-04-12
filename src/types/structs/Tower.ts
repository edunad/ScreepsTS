
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { SettingsController } from "controllers/SettingsController";
import { CakeStruct } from "types/CakeStruct";
import { register } from "utils/Register";


export class Tower extends CakeStruct {
    @register(STRUCTURE_TOWER)
    private defenceMode(hostiles: Creep[]): void {
        ((this as any) as StructureTower).attack(hostiles[0]);
        this.room.visual.text("🔪", this.pos.x, this.pos.y, {color: '#ffffff', align: 'center'});
    }

    @register(STRUCTURE_TOWER)
    private repairMode(): void {
        const maxWall = SettingsController.roomGet(this.room.name, 'WALL_MAX_SPEND', 10000);
        const brokenStuff = this.room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType != STRUCTURE_WALL ? structure.hits < structure.hitsMax / 1.1 : structure.hits < maxWall});

        if(!brokenStuff.length) {
            this.room.visual.text("💤", this.pos.x, this.pos.y, {color: '#ffffff', align: 'center'});
            return;
        }

        if(((this as any) as StructureTower).repair(brokenStuff[0]) == OK) {
            this.room.visual.text("🔧", this.pos.x, this.pos.y, {color: '#ffffff', align: 'center'});
        }
    }

    public run() {
        const hostiles = this.room.find(FIND_HOSTILE_CREEPS);

        if(hostiles.length) return CakeStruct.execute(this, 'defenceMode', hostiles);
        else CakeStruct.execute(this, 'repairMode');
    }
}