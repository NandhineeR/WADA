export class Conflict {
    conflictParameters?: Map<string, string>;

    code?: string;

    message?: string;

    messageKey?: string;

    constructor(conflict?: Conflict) {
        if (conflict) {
            this.conflictParameters = this.createMapFromObject(conflict.conflictParameters);
            this.code = conflict.code;
            this.message = conflict.message;
            this.messageKey = conflict.messageKey;
        }
    }

    createMapFromObject(conflictParameters: any): Map<string, string> {
        const map = new Map<string, string>();
        Object.keys(conflictParameters).forEach((x: string) => map.set(x, conflictParameters[x]));
        return map;
    }
}
