export class AbpAccess {
    athleteId: number | null;

    relationshipSourceOrgId?: number | null;

    resourceId: number | null;

    resourceType: string;

    sourceOrgId?: number | null;

    sourceOrgName?: string;

    userId: number | null;

    userSpecialties: string;

    userType: string;

    constructor(abpAccess?: Partial<AbpAccess> | null) {
        const {
            athleteId = null,
            relationshipSourceOrgId = null,
            resourceId = null,
            resourceType = '',
            sourceOrgId = null,
            sourceOrgName = '',
            userId = null,
            userSpecialties = '',
            userType = '',
        } = abpAccess || {};
        this.athleteId = athleteId;
        this.relationshipSourceOrgId = relationshipSourceOrgId;
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.sourceOrgId = sourceOrgId;
        this.sourceOrgName = sourceOrgName;
        this.userId = userId;
        this.userSpecialties = userSpecialties;
        this.userType = userType;
    }
}
