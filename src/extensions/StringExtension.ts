'use strict';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface String {
    camelize(): string;
    hash(): number;
}

String.prototype.camelize = function (): string {
    return this.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match: string, index: number) => {
        if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

String.prototype.hash = function (): number {
    let hash: number = 0;
    for (let i: number = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + ((hash << 5) - hash);
    }

    return hash;
};
