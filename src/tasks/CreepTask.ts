import { CreepBase } from "creeps/CreepBase";
import { CreepTask } from "types/CreepTask";

export class CreepTaskBase {
    private creep: CreepBase;

    public onTick(creep: CreepBase): boolean { return false; }
    public onStart(creep: CreepBase) {}
    public onEnd(creep: CreepBase) {}

    public serialize(): object {
        return {};
    }

    public deserialize(data: any): void {

    }

    public getType(): CreepTask {
        return CreepTask.Base;
    }

    public setCreep(creep: CreepBase): void {
        this.creep = creep;
    }

    public getCreep(): CreepBase {
        return this.creep;
    }

    public save(): void {
        const c = this.getCreep();
        if (!c) return;

        c.obj.memory.taskData = this.serialize() ?? {};
        c.obj.memory.taskData.__type = this.getType();
    }
}