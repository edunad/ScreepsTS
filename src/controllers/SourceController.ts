export class SourceController {
    private static sourcesUsed: number[] = [];
    private static sourcesSpace: number[] = [];

    public static isBusy(source: Source) {
        if (typeof this.sourcesUsed[source.id] === 'undefined') return false;
        return this.sourcesUsed[source.id] >= 1 || (this.sourcesSpace[source.id] < this.sourcesUsed[source.id] + 1);
    }

    public static findWalkableTiles(room: Room, pos: RoomPosition): RoomPosition[] {
        const ret: RoomPosition[] = [];
        const terrain = Game.rooms[room.name].getTerrain();

        // TOP ROW
        if(terrain.get(pos.x - 1, pos.y - 1) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x - 1, pos.y, room.name));
        if(terrain.get(pos.x, pos.y - 1) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x, pos.y - 1, room.name));
        if(terrain.get(pos.x + 1, pos.y - 1) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x + 1, pos.y - 1, room.name));

        // MIDDLE ROW
        if(terrain.get(pos.x - 1, pos.y) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x - 1, pos.y, room.name));
        if(terrain.get(pos.x + 1, pos.y) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x + 1, pos.y, room.name));

        // BOTTOM ROW
        if(terrain.get(pos.x - 1, pos.y + 1) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x - 1, pos.y + 1, room.name));
        if(terrain.get(pos.x, pos.y + 1) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x, pos.y + 1, room.name));
        if(terrain.get(pos.x + 1, pos.y + 1) !== TERRAIN_MASK_WALL) ret.push(new RoomPosition(pos.x + 1, pos.y + 1, room.name));

        return ret;
    }

    public static addBusy(source: Source) {
        if (typeof this.sourcesUsed[source.id] === 'undefined') {
            this.sourcesSpace[source.id] = this.findWalkableTiles(source.room, source.pos).length;
        }

        this.sourcesUsed[source.id]++;
        //console.log(`source added ${source.id}:${this.sourcesUsed[source.id]}`)
    }

    public static removeBusy(source: Source) {
        if (typeof this.sourcesUsed[source.id] === 'undefined') this.sourcesUsed[source.id] = 0;
        this.sourcesUsed[source.id]--;
        //console.log(`source removed ${source.id}:${this.sourcesUsed[source.id]}`)
    }
}
