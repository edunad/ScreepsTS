import { catchError } from './utils/ScreepsERR';

export const loop = catchError(() => {
    // DELETE OLD MEMORIES
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    // ---
});
