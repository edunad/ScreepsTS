'use strict';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Number {
    toRGBHex(): string;
}

Number.prototype.toRGBHex = function (): string {
    const c: string = Math.floor(Math.abs(((Math.sin(this as number) * 10000) % 1) * 16777216)).toString(16);
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};
