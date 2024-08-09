export const DCF_STATUS_COMPLETED = 'Complete';
export const DCF_STATUS_DRAFT = 'NotProcessed';
export const DCF_STATUS_CANCELLED = 'Cancel';

export class DCFStatus {
    id: number | null;

    specificCode: string;

    ownerType: string;

    constructor(dcfStatus?: Partial<DCFStatus> | null) {
        const { id = null, specificCode = '', ownerType = '' } = dcfStatus || {};

        this.id = id;
        this.specificCode = specificCode;
        this.ownerType = ownerType;
    }
}
