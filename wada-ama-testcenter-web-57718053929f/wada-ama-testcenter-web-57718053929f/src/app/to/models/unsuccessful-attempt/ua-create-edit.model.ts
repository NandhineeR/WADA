import { FormGroup } from '@angular/forms';
import { FieldsSecurity } from '@shared/models';
import { NumberOfErrorsPerCategory } from '@shared/utils/form-util';
import { UA } from './ua.model';
import { UAStatus } from '../enums/ua-status.enum';

export interface ICreateEditUA {
    testId: string;
    title: string;
    active: boolean;
    form: FormGroup;
    data?: UA;
    uas?: Array<UA>;
    status?: UAStatus;
    errors?: Array<any>;
    errorsPerCategory?: NumberOfErrorsPerCategory;
    security?: FieldsSecurity;
}
