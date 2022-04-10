import { SettingsController } from "controllers/SettingsController";
import { register } from "utils/Register";

declare var __registry: any;

export abstract class CakeCreep extends Creep {
    public run(): void {}
    public dead(): void {}

    @register('GLOBAL')
    private goAFK(say: string = '😿'): void {
        if(this.memory.lastDeadTickCheck) return;
        const afkPos = SettingsController.get(this.room.name, 'AFK_POS', {x: 3, y: 3});

        this.memory.lastPos = this.pos;
        this.moveTo(afkPos.x, afkPos.y, {visualizePathStyle: {stroke: '#ffaa00'}});

        if(this.memory.lastPos.x === this.pos.x && this.memory.lastPos.y === this.pos.y) {
            this.say('💤');
            this.memory.lastDeadTickCheck = 4;
        } else {
            this.say(say);
        }
    }

    public static execute(creep: any, id: string, ...values: any): any {
        const isGlobal = global.__registry['GLOBAL'][id]; // First check "global methods"
        if(isGlobal) return isGlobal.bind(creep)(...values);

        // "Then registered constructor-less ones"
        return global.__registry[creep.memory.role][id].bind(creep)(...values);
    }
}