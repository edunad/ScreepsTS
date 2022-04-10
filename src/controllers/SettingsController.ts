
import config from '../settings.json';

export class SettingsController {
    public static get(roomID: string, val: any, defaultVal: any = null): any {
        const roomConfig = config[roomID];
        if(!roomConfig) return null;

        return roomConfig[val] || defaultVal;
    }
}