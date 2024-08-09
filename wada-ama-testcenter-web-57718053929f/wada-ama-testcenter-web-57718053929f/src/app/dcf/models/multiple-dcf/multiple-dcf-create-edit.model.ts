import { FormGroup } from '@angular/forms';
import { NumberOfErrorsPerCategory } from '@shared/utils/form-util';
import { DCF } from '@dcf/models';
import { FieldsSecurity } from '@shared/models';

export interface IMultipleDCFCreateEdit {
    testId: string;
    athleteId?: string;
    title: string;
    active: boolean;
    form: FormGroup;
    data?: DCF;
    dcfs?: Array<DCF>;
    status?: string;
    errors?: Array<any>;
    errorsPerCategory?: NumberOfErrorsPerCategory;
    fieldsSecurity?: FieldsSecurity;
}
