import { ListItem } from '@shared/models';

export class NonConformity {
    category: ListItem | null;

    description: string;

    constructor(nonConformity?: Partial<NonConformity> | null) {
        const { category = null, description = '' } = nonConformity || {};

        this.category = category;
        this.description = description;
    }
}
