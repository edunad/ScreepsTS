import _ from "lodash";
import { getHive } from "index";
import { CreepTaskMove } from "tasks/CreepTaskMove";
import { CreepRole } from "types/CreepRole";
import { BuildingTemplate } from "./buildings/BuildingTemplate";

const rooms: string[] = ['W6N2'];
export class BuildController {
    private mapping: {[id: string]: BuildingTemplate} = {};

    public tick(): void {
        rooms.forEach(roomName => {
            const room = Game.rooms[roomName];
            if (!this.mapping[roomName]) this.mapping[roomName] = new BuildingTemplate(room);

            const template = this.mapping[roomName];
            template.tick();

            if (!template.isDone() && template.needsKaren()) {
                const creeps = getHive().creeps;
                for (let id in creeps) {
                    if (creeps[id].obj.memory.role === CreepRole.Karen && creeps[id].obj.room.name != room.name) {
                        creeps[id].setTask(new CreepTaskMove(room.controller.pos, 2));
                        console.log('summoning a karen to ' + room.name);
                        break;
                    }
                }
            }
        });
    }
}