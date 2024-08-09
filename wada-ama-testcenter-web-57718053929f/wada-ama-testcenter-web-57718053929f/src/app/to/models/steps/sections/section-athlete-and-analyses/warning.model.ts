export class Warning {
    names: Array<string>;

    objectId: string;

    constructor(warning?: Partial<Warning> | null) {
        const { names = [], objectId = '' } = warning || {};

        this.names = names;
        this.objectId = objectId;
    }

    hasWarning(): boolean {
        return this.names.length > 0;
    }
}
