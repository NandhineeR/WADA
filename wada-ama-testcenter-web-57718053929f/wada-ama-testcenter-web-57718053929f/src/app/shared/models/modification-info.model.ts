import { User } from './user.model';

export class ModificationInfo {
    user: User | null;

    timestamp: number | null;

    organizationName: string;

    constructor(modificationInfo?: Partial<ModificationInfo> | null) {
        const { user = null, timestamp = null, organizationName = '' } = modificationInfo || {};
        this.user = user ? new User(user) : null;
        this.timestamp = timestamp;
        this.organizationName = organizationName;
    }
}
