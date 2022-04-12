
export class VarsController {
    public static isSet(vars: string): boolean {
        return (Game.flags[vars]?.color.toRGBHex() === '#3e24a4' || false);
    }
}