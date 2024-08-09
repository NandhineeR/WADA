import {
    TO_STATUS_CANCELLED,
    TO_STATUS_COMPLETED,
    TO_STATUS_IN_CREATION,
    TO_STATUS_ISSUED,
    TestingOrderStatus,
} from '@to/models';
import { StatusEnum } from '@shared/models';

export function statusEnumToSpecificCode(status: StatusEnum): string {
    switch (status) {
        case StatusEnum.InCreation:
            return TO_STATUS_IN_CREATION;
        case StatusEnum.Issued:
            return TO_STATUS_ISSUED;
        case StatusEnum.Completed:
            return TO_STATUS_COMPLETED;
        case StatusEnum.Cancelled:
            return TO_STATUS_CANCELLED;
        default:
            return `no match for status ${status}`;
    }
}

export function statusFromSpecificCode(status: TestingOrderStatus | null): StatusEnum {
    if (!status) {
        return StatusEnum.InCreation;
    }
    switch (status.specificCode) {
        case TO_STATUS_COMPLETED:
            return StatusEnum.Completed;
        case TO_STATUS_CANCELLED:
            return StatusEnum.Cancelled;
        case TO_STATUS_ISSUED:
            return StatusEnum.Issued;
        case TO_STATUS_IN_CREATION:
            return StatusEnum.InCreation;
        default:
            return StatusEnum.InCreation;
    }
}
