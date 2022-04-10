import { CreepTaskBase } from "tasks/CreepTask";
import { CreepChat } from "types/CreepChat";
import { CreepRole } from "types/CreepRole";

declare global {
    interface Memory {
        uuid: number;
    }

    interface CreepMemory {
        role: CreepRole;
        task: CreepRole;
        taskData: any;
    }
};

export class CreepBase {
    public obj: Creep;
    public id: string;
    public name: string;

    private task: CreepTaskBase = null;
    private died: boolean = false;

    public constructor(creep: Creep){
        this.obj = creep;
        this.id = creep.id;
        this.name = creep.name;
    }

    public isDead(): boolean {
        return this.died;
    }

    public setTask(task: CreepTaskBase): void {
        if (this.task) {
            this.task.onEnd(this);
            this.task = null;
        }

        if (!task) {
            this.task = null;
            if (this.obj?.memory?.taskData) {
                delete this.obj.memory.taskData;
            }
            return;
        }

        this.task = task;
        this.task.setCreep(this);
        this.task.save();

        task.onStart(this);
    }

    public getTask(): CreepTaskBase {
        return this.task;
    }

    public onTick() {
        if (!this.getTask()) {
            this.onGetNextTask();
            if (!this.getTask()) {
                this.obj.say(CreepChat.needTask);
                this.wander();
                return;
            }
        }

        const t = this.getTask();
        if (t.onTick(this)) {
            this.setTask(null);
            this.onTaskCompleted();
        }
    }

    public wander(): void {
        const rnd: any = Math.floor(Math.random() * 8) + 1;
        this.obj.move(rnd);
    }

    public onDeath() {
        if (this.died) return;

        this.died = true;
        this.setTask(null);

        delete Memory.creeps[this.name];
    }

    public onGetNextTask() {}
    public onTaskCompleted() {
        this.onGetNextTask();
    }
}