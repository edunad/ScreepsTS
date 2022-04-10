
declare var __registry: any;
export abstract class CakeCreep extends Creep {
    public run(): void {};
    public dead(): void {};

    public static execute(creep: any, id: string, ...values: any): any {
        return global.__registry[creep.memory.role][id].bind(creep)(...values);
    }
}