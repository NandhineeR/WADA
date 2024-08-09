import { FieldsSecurity } from '@shared/models';
import { UAForm } from './ua-form.model';
import { UAStatus } from '../enums/ua-status.enum';

export interface IViewUA {
    uaId: string;
    title: string;
    active: boolean;
    data?: UAForm;
    status?: UAStatus;
    errors: Set<string>;
    security: FieldsSecurity;
}
