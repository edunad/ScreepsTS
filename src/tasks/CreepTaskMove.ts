import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { throwError } from "utils/ScreepsERR";
import { Traveler } from "utils/Traveler";
import { TravelToOptions } from "utils/TravelerInterfaces";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskMove extends CreepTaskBase {
    private target: RoomPosition;
    private range?: number;
    private travelOptions: TravelToOptions = {style: {color: '#FFFFFF', lineStyle: 'dashed', opacity:.5}, ignoreCreeps: true, ignoreRoads: false};
    private lastRoom: string;
    private lastPos: RoomPosition;
    private posCounter: number = 0;
    private stuckMapping:{[id: string]: number} = {};

    constructor(target?: any, range?: number) {
        super();

        if (typeof target !== 'undefined') this.target = target;
        if (typeof range !== 'undefined') this.range = range;
    }

    public onTick(creep: CreepBase): boolean {
        if (this.lastRoom != creep.obj.room.name) {
            this.lastRoom = creep.obj.room.name;

            if (!this.stuckMapping[creep.obj.room.name]) this.stuckMapping[creep.obj.room.name] = 0;
            this.stuckMapping[creep.obj.room.name]++;

            if (this.stuckMapping[creep.obj.room.name] >= 5) {
                throwError('movement failsafe triggered for ' + creep.name);
                this.target = new RoomPosition(25, 25, this.lastRoom);
                this.stuckMapping = {};
            }
        }

        const pos = creep.obj.pos;
        if (!this.lastPos || !this.lastPos.isEqualTo(pos)) {
            this.posCounter = 0;
            this.lastPos = pos;
        } else {
            if (this.posCounter++ > 5) {
                creep.obj.say(CreepChat.error, true);
                return true;
            }
        }

        if (creep.obj.room.name != this.target.roomName) {
            const exitDir: any = creep.obj.room.findExitTo(this.target.roomName);
            const exitPos = pos.findClosestByRange(exitDir);
            Traveler.travelTo(creep.obj, exitPos, {style: this.travelOptions});

            creep.obj.say(CreepChat.moving, true);
            return false;
        } else if (!pos.isEqualTo(this.target)) {
            if (this.range && this.target.getRangeTo(pos.x, pos.y) < this.range) {
                creep.obj.say(CreepChat.done, true);
                return true;
            }

            const moveret = Traveler.travelTo(creep.obj, this.target, this.travelOptions);
            creep.obj.say(moveret == OK ? CreepChat.moving : CreepChat.tired, true);
            return false;
        }

        creep.obj.say(CreepChat.done, true);
        return true;
    }

    public serialize(): object {
        return {
            x: this.target.x,
            y: this.target.y,
            roomName: this.target.roomName,
            range: this.range,
        };
    }

    public deserialize(data: any): void {
        this.target = new RoomPosition(data.x, data.y, data.roomName);
        this.range = data.range;
    }

    public getType(): CreepTask {
        return CreepTask.Move;
    }
}