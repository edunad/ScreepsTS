import _ from "lodash";
import { CreepTaskAttackMelee } from "tasks/CreepTaskAttackMelee";
import { CreepTaskIdle } from "tasks/CreepTaskIdle";
import { CreepTaskMove } from "tasks/CreepTaskMove";
import { CreepTaskSleep } from "tasks/CreepTaskSleep";
import { EnemyTarget } from "types/EnemyTarget";
import { CreepBase } from "./CreepBase";

export class CreepAdventurer extends CreepBase {
    private movePathVisual = {visualizePathStyle: {stroke: '#FF0000', opacity:.5}};

    public onGetNextTask() {
        //const targetRoom = 'W3N8'; // cake
        //const targetRoom = 'W6N1'; // brom
        //const targetRoom = 'W9N1'; // AI left down corner
        const targetRoom = 'W1N1'; // AI right down corner
        // const targetRoom = 'W9N9'; // AI left top corner
        // const targetRoom = 'W1N9'; // AI right top corner

        if (this.obj.room.name == targetRoom) {
            let targets: EnemyTarget[] = [];
            targets = targets.concat(
                Game.rooms[targetRoom].find(FIND_HOSTILE_CREEPS),
                Game.rooms[targetRoom].find(FIND_HOSTILE_STRUCTURES)
            );

            // filter out controllers if we dont have claim
            // or there's still stuff to kill
            if (targets.length > 1 || this.obj.getActiveBodyparts(CLAIM) == 0) {
                targets = targets.filter((s) => s instanceof Creep || s.structureType != STRUCTURE_CONTROLLER);
            }

            targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s))
            if (targets.length > 0) {
                const t = targets[0];
                if (t instanceof StructureController) {
                    if (t.pos.getRangeTo(this.obj.pos.x, this.obj.pos.y) < 2) {
                        this.obj.claimController(t);
                        this.setTask(new CreepTaskSleep(1));
                    } else {
                        this.setTask(new CreepTaskMove(t.pos, 2));
                    }
                } else {
                    this.setTask(new CreepTaskAttackMelee(t));
                }

                return;
            }
        } else {
            const pos = this.obj.pos;
            if(pos.x * pos.y === 0 || pos.x === 49 || pos.y === 49) {
                const tpos = new RoomPosition(this.obj.pos.x, this.obj.pos.y, this.obj.room.name);
                if (pos.x == 0) tpos.x++; //this.obj.move(RIGHT);
                if (pos.x == 49) tpos.x--; //this.obj.move(LEFT);
                if (pos.y == 0) tpos.y++; //this.obj.move(TOP);
                if (pos.y == 49) tpos.y--; //this.obj.move(BOTTOM);

                this.setTask(new CreepTaskMove(tpos));
                return;
            }

            this.setTask(new CreepTaskMove(new RoomPosition(25 ,25, targetRoom)));
        }
    }
}
