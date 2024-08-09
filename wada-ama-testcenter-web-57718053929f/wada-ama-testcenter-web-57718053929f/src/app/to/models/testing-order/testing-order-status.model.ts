export const TO_STATUS_COMPLETED = 'Complete';
export const TO_STATUS_CANCELLED = 'Cancel';
export const TO_STATUS_ISSUED = 'Pending';
export const TO_STATUS_IN_CREATION = 'NotProcessed';

export class TestingOrderStatus {
    id: number | null;

    specificCode: string;

    description: string;

    ownerType: string;

    constructor(testingOrderStatus?: Partial<TestingOrderStatus> | null) {
        const { id = null, specificCode = '', ownerType = '', description = '' } = testingOrderStatus || {};

        this.id = id;
        this.specificCode = specificCode;
        this.description = description;
        this.ownerType = ownerType;
    }
}
