import config from '../settings.json';

export class SettingsController {
    public static get(key: string, defaultVal: any = null): any {
        return config[key] || defaultVal;
    }

    public static roomGet(roomID: string, key: string, defaultVal: any = null): any {
        const roomConfig = config[roomID];
        if (!roomConfig) return defaultVal;

        return roomConfig[key] || defaultVal;
    }
}
