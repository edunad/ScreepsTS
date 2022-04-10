import _ from "lodash";
import { CreepTaskAttackMelee } from "tasks/CreepTaskAttackMelee";
import { CreepTaskIdle } from "tasks/CreepTaskIdle";
import { EnemyTarget } from "types/EnemyTarget";
import { CreepBase } from "./CreepBase";

export class CreepFighterMelee extends CreepBase {
    public onGetNextTask() {
        const mobs = this.obj.room.find(FIND_HOSTILE_CREEPS);
        const structs = this.obj.room.find(FIND_HOSTILE_STRUCTURES);

        let targets: EnemyTarget[] = [];
        targets = targets.concat(structs, mobs);
        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s))

        if (targets.length > 0) {
            this.setTask(new CreepTaskAttackMelee(targets[0]));
            return;
        }

        this.setTask(new CreepTaskIdle(2));
    }
}
