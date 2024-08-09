import { GenericStatus } from '@shared/models/generic-status.model';
import { FindingType } from './finding-type.enum';

export class Finding {
    id: string;

    type: FindingType;

    status: GenericStatus | null;

    constructor(finding?: Partial<Finding> | null) {
        const { id = '', type = FindingType.None, status = null } = finding || {};

        this.id = id;
        this.type = type;
        this.status = status ? new GenericStatus(status) : null;
    }
}
