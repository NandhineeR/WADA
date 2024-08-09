export class Disability {
    id: string;

    specificCode: string;

    description: string;

    constructor(diability?: Partial<Disability> | null) {
        const { id = '', specificCode = '', description = '' } = diability || {};

        this.id = id;
        this.specificCode = specificCode;
        this.description = description;
    }
}
