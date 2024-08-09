export class EntityDescription {
    id: string;

    description: string;

    shortDescription: string;

    constructor(entity?: Partial<EntityDescription> | null) {
        const { id = '', description = '', shortDescription = '' } = entity || {};

        this.id = id;
        this.description = description;
        this.shortDescription = shortDescription;
    }
}
