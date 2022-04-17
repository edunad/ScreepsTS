
import { getHive } from "index";
import _ from "lodash";
import { CreepTaskMove } from "tasks/CreepTaskMove";
import { CreepChat } from "types/CreepChat";
import { CreepRole } from "types/CreepRole";
import { BuildingTemplate1 } from "./buildings/BuildingTemplate1";
import { BuildingTemplateBase } from "./buildings/BuildingTemplateBase";

const rooms: string[] = ['W6N2'];

export class BuildController {
    private y: number = 0;
    private mapping: {[id: number]: BuildingTemplateBase} = {};

    constructor() {
        this.addLevel(1, new BuildingTemplate1());
    }

    private createFlag(room: Room, msg: string){
        //room.visual.text(msg, 0, this.y++, {color: '#FF0000', align: 'left'});
    }

    public addLevel(level: number, obj: BuildingTemplateBase) {
        this.mapping[level] = obj;
    }

    public tick(): void {
        rooms.forEach(roomName => {
            const room = Game.rooms[roomName];
            for (let i = 1; i < room.controller.level + 1; i++) {
                const template = this.mapping[i];
                if (!template) break;

                template.setRoom(room)
                template.tick();
                if (!template.isDone()) {
                    if (template.needsKaren()) {
                        const creeps = getHive().creeps;
                        for (let id in creeps) {
                            if (creeps[id].obj.memory.role === CreepRole.Karen && creeps[id].obj.room.name != room.name) {
                                creeps[id].setTask(new CreepTaskMove(new RoomPosition(25, 25, room.name)));
                                console.log('summoning a karen to ' + room.name);
                                break;
                            }
                        }
                    }

                    break;
                }
            }
        });
    }
}