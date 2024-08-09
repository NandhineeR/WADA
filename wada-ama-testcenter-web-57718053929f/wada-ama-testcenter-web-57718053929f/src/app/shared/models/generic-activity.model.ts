import { User } from './user.model';

export class GenericActivity {
    id: string;

    subject: string;

    referenceDate: string;

    type: string | undefined;

    createdBy: User | undefined;

    lastUpdatedBy: User | undefined;

    modUserOrgShortName: string;

    constructor(genericActivity?: Partial<GenericActivity> | null) {
        const {
            id = '',
            subject = '',
            referenceDate = '',
            type = '',
            createdBy = new User(),
            lastUpdatedBy = new User(),
            modUserOrgShortName = '',
        } = genericActivity || {};

        this.id = id;
        this.subject = subject;
        this.referenceDate = referenceDate;
        this.type = type;
        this.createdBy = createdBy;
        this.lastUpdatedBy = lastUpdatedBy;
        this.modUserOrgShortName = modUserOrgShortName;
    }
}
