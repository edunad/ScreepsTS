
import type { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

import { Traveler } from "libs/Traveler";
import { CakeCreep } from "types/CakeCreep";
import { register } from "utils/Register";
import { VarsController } from "controllers/VarsController";

export interface AttackerMemory extends CreepMemory {}

export class Attacker extends CakeCreep {
    public memory: AttackerMemory;

    @register('Attacker')
    private defenceMode(): void {
        const targets = this.room.find(FIND_HOSTILE_CREEPS);
        if(!targets.length) return CakeCreep.execute(this, 'goAFK', '🪓?');

        if(this.attack(targets[0]) == ERR_NOT_IN_RANGE) {
            Traveler.travelTo(this, targets[0], {style: {stroke: '#ffffff'}});
            this.say('🔪');
        }
    }

    public dead() {
        console.log("Attacker died! D:");
    }

    public run() {
        /*Game.flags[]
        const inWar = VarsController.isSet(`${}_WAR`);*/
        CakeCreep.execute(this, 'defenceMode');
    }
}