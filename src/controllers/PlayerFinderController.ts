import { CakeCreep } from 'types/CakeCreep';

export type RoomExits = FIND_EXIT_TOP | FIND_EXIT_BOTTOM | FIND_EXIT_LEFT | FIND_EXIT_RIGHT | ERR_NO_PATH;
const roomBlackList: { [id: string]: { [id: string]: RoomExits } } = {
    Bob: {
        W6N6: FIND_EXIT_BOTTOM,
        W6N5: FIND_EXIT_RIGHT,
        W5N5: FIND_EXIT_BOTTOM,
        W5N4: FIND_EXIT_BOTTOM,
        W8N3: FIND_EXIT_BOTTOM,
    },
};

export class PlayerFinderController {
    public static calculateNextRoom(creep: CakeCreep, ply: [string, string]): RoomExits {
        const blacklist = roomBlackList[ply[0]];
        if (blacklist && blacklist[creep.room.name]) {
            return blacklist[creep.room.name];
        }

        const exits = creep.room.findExitTo(ply[1]);
        if (exits === ERR_INVALID_ARGS) return ERR_NO_PATH;
        return exits;
    }
}
