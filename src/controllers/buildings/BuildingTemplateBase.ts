export class BuildingTemplateBase {
    private room: Room;

    public needsKaren(): boolean {
        return false;
    }

    public tick(): void {

    }

    public isDone(): boolean {
        return false;
    }

    public setRoom(room: Room): void {
        this.room = room;
    }

    public getRoom(): Room {
        return this.room;
    }
}
