import { ErrorEnum } from './enums/error.enum';

export class FieldError {
    code: ErrorEnum | null;

    description: string;

    hasError: boolean;

    inputId: string;

    sampleType: string;

    constructor(error?: Partial<FieldError> | null) {
        const { code = null, description = '', hasError = false, inputId = '', sampleType = '' } = error || {};

        this.code = code;
        this.description = description;
        this.hasError = hasError;
        this.inputId = inputId;
        this.sampleType = sampleType;
    }
}
