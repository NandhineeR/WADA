import { StatusEnum } from '@shared/models';
import { DCF_STATUS_CANCELLED, DCF_STATUS_COMPLETED, DCF_STATUS_DRAFT, DCFStatus } from '@dcf/models';

export function statusFromSpecificCode(status: DCFStatus | null): StatusEnum {
    if (!status || status == null) {
        return StatusEnum.Draft;
    }
    switch (status.specificCode) {
        case DCF_STATUS_COMPLETED:
            return StatusEnum.Completed;
        case DCF_STATUS_DRAFT:
            return StatusEnum.Draft;
        case DCF_STATUS_CANCELLED:
            return StatusEnum.Cancelled;
        default:
            return StatusEnum.Draft;
    }
}
