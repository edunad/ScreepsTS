export class SourceController {
    private static sourcesUsed: number[] = [];
    private static sourcesSpace: number[] = [];

    public static isBusy(source: Source) {
        if (typeof this.sourcesUsed[source.id] === 'undefined') return false;
        return this.sourcesUsed[source.id] >= 1 || (this.sourcesSpace[source.id] < this.sourcesUsed[source.id] + 1);
    }

    public static addBusy(source: Source) {
        if (typeof this.sourcesUsed[source.id] === 'undefined') {
            this.sourcesUsed[source.id] = 0;

            const terrain = source.room.getTerrain();
            const pos = source.pos;

            let maxCreeps = 8;

            // TOP ROW
            if(terrain.get(pos.x - 1, pos.y - 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x, pos.y - 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x + 1, pos.y - 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;

            // MIDDLE ROW
            if(terrain.get(pos.x - 1, pos.y) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x + 1, pos.y) === TERRAIN_MASK_WALL) maxCreeps -= 1;

            // BOTTOM ROW
            if(terrain.get(pos.x - 1, pos.y + 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x, pos.y + 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;
            if(terrain.get(pos.x + 1, pos.y + 1) === TERRAIN_MASK_WALL) maxCreeps -= 1;

            this.sourcesSpace[source.id] = maxCreeps;
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
