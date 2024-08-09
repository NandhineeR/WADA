export class Reason {
    objectId: string;

    details: string;

    constructor(reason?: Partial<Reason> | null) {
        const { objectId = '', details = '' } = reason || {};

        this.objectId = objectId;
        this.details = details;
    }
}
