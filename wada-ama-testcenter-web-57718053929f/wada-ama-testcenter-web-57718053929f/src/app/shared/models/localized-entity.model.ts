import { SpecificCode } from './enums/specific-code.enum';

export class LocalizedEntity {
    id: string;

    description: string;

    locale: string;

    specificCode: SpecificCode;

    constructor(localizedEntity?: Partial<LocalizedEntity> | null) {
        const { id = '', description = '', locale = '', specificCode = SpecificCode.None } = localizedEntity || {};

        this.id = id;
        this.description = description;
        this.locale = locale;
        this.specificCode = specificCode;
    }
}
