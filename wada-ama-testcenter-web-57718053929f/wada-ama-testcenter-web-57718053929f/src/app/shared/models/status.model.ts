export class Status {
    id: number | null;

    specificCode: string | null;

    ownerType: string | null;

    description: string | null;

    constructor(status?: Partial<Status> | null) {
        const { id = null, specificCode = null, ownerType = null, description = null } = status || {};

        this.id = id;
        this.specificCode = specificCode;
        this.ownerType = ownerType;
        this.description = description;
    }
}
