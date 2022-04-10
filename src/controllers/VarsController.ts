
export type GAME_VARS = 'UPGRADE_ENABLED'
export class VarsController {
    public static isSet(vars: GAME_VARS): boolean {
        return (Game.flags[vars]?.color.toRGBHex() === '#3e24a4' || false);
    }
}