import { Traveler } from 'libs/Traveler';

import { SettingsController } from 'controllers/SettingsController';
import { register } from 'utils/Register';

export abstract class CakeCreep extends Creep {
    public run(): void {}
    public dead(): void {}

    @register('GLOBAL')
    private goAFK(say: string = '😿'): void {
        if (this.memory.sleepTick) return;
        const afkPos = SettingsController.roomGet(this.room.name, 'AFK_POS', { x: 3, y: 3 });

        Traveler.travelTo(this, this.room.getPositionAt(afkPos.x, afkPos.y), { style: { stroke: '#ffaa00' } });
        this.say(say);

        this.memory.sleepTick = 4;
    }

    @register('GLOBAL')
    private collectMode(): void {
        const structs = this.room.find(FIND_STRUCTURES, {
            filter: (structure) =>
                (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_SPAWN) &&
                ((structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > this.store.getFreeCapacity()) ||
                    (structure.structureType === STRUCTURE_SPAWN && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 200)),
        });

        if (!structs.length) return CakeCreep.execute(this, 'goAFK', '⚡?');
        if (this.withdraw(structs[0], RESOURCE_ENERGY, this.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
            Traveler.travelTo(this, structs[0], { style: { stroke: '#ffffff' } });
            this.say('🏃‍♀️');
        }
    }

    public static executeSpecial(creep: any, methodId: string, id: string, ...values: any): any {
        const isGlobal = global.__registry['GLOBAL'][id]; // First check "global methods"
        if (isGlobal) return isGlobal.bind(creep)(...values);

        // Then registered constructor-less ones
        return global.__registry[methodId][id].bind(creep)(...values);
    }

    public static execute(creep: any, id: string, ...values: any): any {
        const isGlobal = global.__registry['GLOBAL'][id]; // First check "global methods"
        if (isGlobal) return isGlobal.bind(creep)(...values);

        // Then registered constructor-less ones
        return global.__registry[creep.memory.role][id].bind(creep)(...values);
    }
}
