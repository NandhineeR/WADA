import { EntityDescription } from '@shared/models';

export class OrganizationRelationship {
    source: EntityDescription | null;

    entityType: string;

    right: string;

    startDate: Date | null;

    endDate: Date | null;

    constructor(organization?: OrganizationRelationship | null) {
        const { source = null, entityType = '', right = '', startDate = null, endDate = null } = organization || {};

        this.source = source ? new EntityDescription(source) : null;
        this.entityType = entityType;
        this.right = right;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
