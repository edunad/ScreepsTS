

export abstract class CakeStruct extends OwnedStructure {
    public run(): void {}
    public static execute(structure: Structure, id: string, ...values: any): any {
        const isGlobal = global.__registry['GLOBAL'][id]; // First check "global methods"
        if(isGlobal) return isGlobal.bind(structure)(...values);

        // "Then registered constructor-less ones"
        return global.__registry[structure.structureType][id].bind(structure)(...values);
    }
}