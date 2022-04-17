import _ from "lodash";
import { CreepTaskAttackMelee } from "tasks/CreepTaskAttackMelee";
import { CreepTaskIdle } from "tasks/CreepTaskIdle";
import { CreepTaskMove } from "tasks/CreepTaskMove";
import { CreepTaskSleep } from "tasks/CreepTaskSleep";
import { EnemyTarget } from "types/EnemyTarget";
import { CreepBase } from "./CreepBase";

//const targetRoom = 'W3N8'; // cake
//const targetRoom = 'W9N8'; // harry
//const targetRoom = 'W8N7'; // harry group
//const targetRoom = 'W6N1'; // brom 1
const targetRoom = 'W6N2'; // brom 2
//const targetRoom = 'W6N3'; // center
//const targetRoom = 'W9N1'; // AI left down corner
//const targetRoom = 'W1N1'; // AI right down corner
// const targetRoom = 'W9N9'; // AI left top corner
// const targetRoom = 'W1N9'; // AI right top corner
export class CreepAdventurer extends CreepBase {
    private movePathVisual = {visualizePathStyle: {stroke: '#FF0000', opacity:.5}};

    public onTick(): void {
        super.onTick();

        // stop them a bit in the room so they can go attack
        if (this.getTask() instanceof CreepTaskMove) {
            let targets = this.getHostiles();
            if (targets.length > 0) this.setTask(null);

            if (this.obj.room.name == targetRoom) {
                const pos = this.obj.pos;
                if(!(pos.x <= 5 || pos.y <= 5 || pos.x >= 45 || pos.y >= 45)) {
                    this.setTask(null);
                }
            }
        }
    }

    private getHostiles() {
        let targets: EnemyTarget[] = [];
        targets = targets.concat(
            this.obj.room.find(FIND_HOSTILE_CREEPS),
            this.obj.room.find(FIND_HOSTILE_STRUCTURES),
            this.obj.room.controller ? [this.obj.room.controller] : []
        );

        // filter out controllers if we dont have claim
        // or there's still stuff to kill
        if (targets.length > 1 || this.obj.getActiveBodyparts(CLAIM) == 0) {
            targets = targets.filter((s) => s instanceof Creep || s.structureType != STRUCTURE_CONTROLLER);
        }

        return targets;
    }

    public onGetNextTask() {
        let targets = this.getHostiles();

        targets = _.sortBy(targets, s => this.obj.pos.getRangeTo(s))
        if (targets.length > 0) {
            const t = targets[0];
            if (t instanceof StructureController) {
                if (t.owner.username !== this.obj.owner.username) {
                    if (t.pos.getRangeTo(this.obj.pos.x, this.obj.pos.y) < 2) {
                        this.obj.claimController(t);
                        this.setTask(new CreepTaskSleep(1));
                    } else {
                        this.setTask(new CreepTaskMove(t.pos, 2));
                    }
                }
            } else {
                //if (this.obj.room.controller?.pos.getRangeTo(this.obj.pos) < 2) {
                //    this.obj.signController(this.obj.room.controller, 'VOTE BOB FOR PRESIDENT')
                //} else {
                //    this.setTask(new CreepTaskMove(this.obj.room.controller.pos));
                //}
                this.setTask(new CreepTaskAttackMelee(t));
                //this.setTask(new CreepTaskIdle(10));
                //this.setTask(new CreepTaskMove(new RoomPosition(28, 30, targetRoom)));
            }

            return;
        }

        if (this.obj.room.name != targetRoom) {
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

            this.setTask(new CreepTaskMove(new RoomPosition(25, 25, targetRoom)));
        } else {
            /*if ( this.obj.signController(this.obj.room.controller, 'VOTE BOB FOR PRESIDENT') == OK) {
                this.setTask(new CreepTaskIdle(10));
                // this.obj.signController(this.obj.room.controller, 'VOTE BOB FOR PRESIDENT')
            } else {
                this.setTask(new CreepTaskMove(this.obj.room.controller.pos, 1));
                return;
            }*/

            //this.setTask(new CreepTaskAttackMelee(t));
            //this.setTask(new CreepTaskIdle(10));
            this.setTask(new CreepTaskMove(new RoomPosition(25, 25, targetRoom)));
        }
    }
}
