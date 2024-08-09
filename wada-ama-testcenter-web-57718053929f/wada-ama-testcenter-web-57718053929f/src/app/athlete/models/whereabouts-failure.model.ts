import { ListItem, StatusEnum } from '@shared/models';

export class WhereaboutsFailure {
    id: number | null;

    referenceDate: Date | null;

    status: StatusEnum | null;

    type: ListItem | null;

    comment: string;

    constructor(failure?: Partial<WhereaboutsFailure> | null) {
        const { id = null, referenceDate = null, status = null, type = null, comment = '' } = failure || {};

        this.id = id;
        this.referenceDate = referenceDate;
        this.status = status;
        this.type = type;
        this.comment = comment;
    }
}
