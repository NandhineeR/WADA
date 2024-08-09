import { FieldsSecurity } from '@shared/models';
import { DCFForm } from '../dcf/dcf-form.model';

export interface IMultipleDCFView {
    dcfId: string;
    title: string;
    active: boolean;
    data?: DCFForm;
    fieldsSecurity: FieldsSecurity;
    status?: string;
    errors: Set<string>;
    sampleErrors: number;
}
