import type { LoDashStatic } from 'lodash';
declare var _: LoDashStatic;

import { VarsController } from 'controllers/VarsController';
import { SettingsController } from 'controllers/SettingsController';
import { PlayerFinderController, RoomExits } from 'controllers/PlayerFinderController';

import { Traveler } from 'libs/Traveler';
import { CakeCreep } from 'types/CakeCreep';
import { register } from 'utils/Register';

export interface AttackerMemory extends CreepMemory {
    roomTargetSCAN?: string;
    roomTargetPOS?: RoomExits;
    roomUnstuck?: number;

    inWarWith?: [string, string];
}

export class Attacker extends CakeCreep {
    public memory: AttackerMemory;

    @register('Attacker')
    private defenceMode(): void {
        const targets = this.room.find(FIND_HOSTILE_CREEPS);
        if (!targets.length) return CakeCreep.execute(this, 'goAFK', '🪓?');

        if (this.attack(targets[0]) == ERR_NOT_IN_RANGE) {
            Traveler.travelTo(this, targets[0], { style: { stroke: '#ffffff' } });
            this.say('🔪');
        }
    }

    @register('Attacker')
    private createHAVOC(): void {
        const structs = this.room.find(FIND_HOSTILE_STRUCTURES, { filter: (struct) => !struct.my });
        if (this.attack(structs[0]) == ERR_NOT_IN_RANGE) {
            Traveler.travelTo(this, structs[0], { style: { stroke: '#ff0000' } });
            this.say('🔪', true);
        } else {
            this.say('😾', true);
        }
    }

    @register('Attacker')
    private createColdWar(): void {
        const structs = this.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (struct) => !struct.my && struct.structureType === 'controller',
        });

        Traveler.travelTo(this, structs[0], { style: { stroke: '#ff0000' } });
        this.say('C++ SUCKS', true);
    }

    @register('Attacker')
    private warMode(): void {
        if (!this.memory.inWarWith) {
            const players: string[] = SettingsController.get('Players', {});
            const plys = Object.entries(players);

            for (let i: number = 0; i < plys.length; i++) {
                const inWar = VarsController.isSet(`${plys[i][0]}_WAR`);
                if (inWar) {
                    this.memory.inWarWith = plys[i];
                    console.log(`⚠ Found war player ${plys[i][0]}`);
                    return;
                }
            }

            console.log('No war flags set 😿, auto-disable war mode');
            Game.flags[`WAR_ENABLED`].setColor(COLOR_RED);
        } else {
            if (this.room.name === this.memory.inWarWith[1]) {
                //CakeCreep.execute(this, 'createHAVOC');
                CakeCreep.execute(this, 'createColdWar');
            } else {
                if (!this.memory.roomTargetSCAN) {
                    const exit = PlayerFinderController.calculateNextRoom(this, this.memory.inWarWith);
                    if (exit == ERR_NO_PATH) {
                        this.say('😨');
                        return;
                    }

                    this.memory.roomTargetPOS = exit;
                    this.memory.roomTargetSCAN = this.room.name; // The room we scanned in
                    this.say(`🧠`);
                    return;
                } else {
                    CakeCreep.execute(this, 'moveToWar');
                }
            }
        }
    }

    @register('Attacker')
    private moveToWar(): void {
        if (this.memory.roomTargetPOS == ERR_NO_PATH) return;

        const exits = this.room.find(this.memory.roomTargetPOS);
        const exit = _.sortBy(exits, (exit) => exit.getRangeTo(this.pos))[0];

        if (!exit) {
            // No exits found?
            CakeCreep.execute(this, 'clearTarget');
            return;
        }

        // We are in the room we scanned, keep travelling to the exit
        if (this.room.name === this.memory.roomTargetSCAN) {
            Traveler.travelTo(this, exit, { style: { stroke: '#ffffff' }, offRoad: false, repath: 0 });
            this.say('🪓');
            return;
        } else {
            // We have arrived to the room, get out of the room pad
            switch (this.memory.roomTargetPOS) {
                case FIND_EXIT_TOP:
                    this.move(TOP);
                    break;
                case FIND_EXIT_LEFT:
                    this.move(LEFT);
                    break;
                case FIND_EXIT_RIGHT:
                    this.move(RIGHT);
                    break;
                default:
                case FIND_EXIT_BOTTOM:
                    this.move(BOTTOM);
                    break;
            }

            CakeCreep.execute(this, 'clearTarget');
        }
    }

    @register('Attacker')
    private clearTarget(): void {
        this.memory.roomTargetSCAN = null;
        this.memory.roomTargetPOS = null;
    }

    public dead() {
        console.log('Attacker died! D:');
    }

    public run() {
        const warEnabled = VarsController.isSet(`WAR_ENABLED`);
        if (warEnabled) CakeCreep.execute(this, 'warMode');
        else {
            this.memory.inWarWith = null;

            CakeCreep.execute(this, 'clearTarget');
            CakeCreep.execute(this, 'defenceMode');
        }
    }
}
