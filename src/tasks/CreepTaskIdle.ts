import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskIdle extends CreepTaskBase {
    private chat: string = CreepChat.idle;
    private ticks: number = 0;
    private movePathVisual = {visualizePathStyle: {stroke: '#FFFFFF', opacity:.5}};

    constructor(ticks?: number, chat?: string) {
        super();

        if (typeof ticks !== 'undefined') this.ticks = ticks;
        if (typeof chat !== 'undefined') this.chat = chat;
    }

    public onTick(creep: CreepBase): boolean {
        this.ticks--;
        this.save();

        if (this.ticks <= 0) {
            creep.obj.say(CreepChat.done);
            return true;
        }

        creep.obj.say(this.chat);
        creep.wander();
        return false;
    }

    public serialize(): object {
        return {
            chat: this.chat,
            ticks: this.ticks
        };
    }

    public deserialize(data: any): void {
        this.chat = data.chat;
        this.ticks = data.ticks;
    }

    public getType(): CreepTask {
        return CreepTask.Idle;
    }
}