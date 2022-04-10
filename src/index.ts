import { catchError } from './utils/ScreepsERR';
import { HiveController } from './controllers/HiveController';

var hive = new HiveController();
hive.init();

export const getHive = (): HiveController => {
    return hive;
};

declare var module: any;
module.exports.loop = () => {
    hive.tick();
}