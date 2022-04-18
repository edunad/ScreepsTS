import _ from "lodash";

export class DiamondTemplate {
    public shape: string;
    public room: Room;
    public locations: RoomPosition[];
    public roads: RoomPosition[];

    private diamondSize: number = 7;

    constructor(room: Room) {
        this.room = room;
    }

    private getSpawnerLocation(): RoomPosition {
        const structures = this.room.find(FIND_MY_STRUCTURES).filter((x) => x.structureType === STRUCTURE_SPAWN);
        const spawner = structures[0] as StructureSpawn;
        if (!spawner) {
            // TODO: find actual room spot with more than 5-6 tiles of space in each direction
            return new RoomPosition(25, 25, this.room.name);
        }

        return spawner.pos;
    }

    public findSpot(type: StructureConstant): RoomPosition {
        if (!this.shape) this.generate();

        const center = this.getSpawnerLocation();
        const byRange = _.sortBy(this.locations, s => center.getRangeTo(s));

        if (byRange.length === 0) return null;
        const closest = byRange[0];

        // spot was taken
        if (this.room.lookAt(closest.x, closest.y).filter((x) => x.structure || x.constructionSite).length > 0) {
            // remove and try again
            this.locations = this.locations.filter((x) => !x.isEqualTo(closest));
            return this.findSpot(type);
        }

        return byRange[0];
    }

    public getNextRoad(): RoomPosition {
        if (!this.shape) this.generate();

        const center = this.getSpawnerLocation();
        const byRange = _.sortBy(this.roads, s => center.getRangeTo(s));

        if (byRange.length === 0) return null;
        const closest = byRange[0];

        // something is already on the road spot
        if (this.room.lookAt(closest.x, closest.y).filter((x) => x.structure || x.constructionSite).length > 0) {
            // remove and try again
            this.roads = this.roads.filter((x) => !x.isEqualTo(closest));
            return this.getNextRoad();
        }

        return byRange[0];
    }

    private generate(): void {
        //////////////////////////////////////////////////////////////////////////////////
        // https://www.codegrepper.com/code-examples/javascript/draw+diamond+in+typescript
        // I dont know what the duck is happening here, but it works! Yay javascript!
        //////////////////////////////////////////////////////////////////////////////////
        let y: number, w: number, shape: string = '';
        const val = this.diamondSize;

        for (y = 0; y < val * 2 - 1; y++) {
            w = y < val ? y : val * 2 - y - 2;
            shape += Array(val - w).join(' ') + Array(w + 1).join('* ') + '*\n';
        }
        //////////////////////////////////////////////////////////////////////////////////

        const terrain = this.room.getTerrain();
        const spawnerPos = this.getSpawnerLocation();

        this.roads = [];
        this.locations = [];

        let x = 0;
        y = 0;
        for (let i = 0; i < shape.length; i++) {
            const pos = new RoomPosition(x - val + spawnerPos.x, y - val + spawnerPos.y, this.room.name);
            switch (shape[i]) {
                case '*':
                    if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) break;
                    if (this.room.lookAt(pos.x, pos.y).filter((x) => x.structure || x.constructionSite).length > 0) break;

                    this.locations.push(pos);
                    break;

                case ' ':
                    // filter out corners of the diamond
                    if (shape[i - 1] !== ' ' && shape[i + 1] !== ' '){
                        if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) break;
                        if (this.room.lookAt(pos.x, pos.y).filter((x) => x.structure || x.constructionSite).length > 0) break;

                        this.roads.push(pos);
                    }
                    break;

                case '\n':
                    x = -1;
                    y++;
                    break;
            }

            x++;
        }

        this.shape = shape;
    }
}
