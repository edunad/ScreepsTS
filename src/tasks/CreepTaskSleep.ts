import { CreepBase } from "creeps/CreepBase";
import { CreepChat } from "types/CreepChat";
import { CreepTask } from "types/CreepTask";
import { CreepTaskBase } from "./CreepTask";

export class CreepTaskSleep extends CreepTaskBase {
    private ticks: number = 0;
    private movePathVisual = {visualizePathStyle: {stroke: '#FFFFFF', opacity:.5}};

    constructor(ticks?: number, chat?: string) {
        super();

        if (typeof ticks !== 'undefined') this.ticks = ticks;
    }

    public onTick(creep: CreepBase): boolean {
        if (this.ticks <= 0) return true;

        this.ticks--;
        this.save();

        return false;
    }

    public serialize(): object {
        return {
            ticks: this.ticks
        };
    }

    public deserialize(data: any): void {
        this.ticks = data.ticks;
    }

    public getType(): CreepTask {
        return CreepTask.Sleep;
    }
}