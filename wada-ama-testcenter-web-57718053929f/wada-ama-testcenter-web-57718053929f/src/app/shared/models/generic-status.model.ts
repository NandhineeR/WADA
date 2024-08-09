import { SpecificCode } from './enums/specific-code.enum';

export class GenericStatus {
    id: number | null;

    description: string;

    locale: string;

    ownerType: string;

    reason: string;

    specificCode: SpecificCode;

    wadaReason: string;

    constructor(status?: Partial<GenericStatus> | null) {
        const {
            id = null,
            description = '',
            locale = '',
            ownerType = '',
            reason = '',
            specificCode = SpecificCode.None,
            wadaReason = '',
        } = status || {};

        this.id = id;
        this.description = description;
        this.locale = locale;
        this.ownerType = ownerType;
        this.reason = reason;
        this.specificCode = specificCode;
        this.wadaReason = wadaReason;
    }
}
