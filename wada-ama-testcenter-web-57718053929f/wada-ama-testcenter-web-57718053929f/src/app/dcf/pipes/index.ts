import { DurationPipe } from './duration.pipe';
import { FormControlErrorsPipe } from './control-errors.pipe';
import { FormControlKeysPipe } from './form-controls.pipe';
import { FormControlWarningsPipe } from './control-warnings.pipe';
import { FormErrorsPipe } from './form-errors.pipe';

export const pipes: Array<any> = [
    DurationPipe,
    FormControlErrorsPipe,
    FormControlKeysPipe,
    FormControlWarningsPipe,
    FormControlWarningsPipe,
    FormErrorsPipe,
];

export * from './control-errors.pipe';
export * from './control-warnings.pipe';
export * from './duration.pipe';
export * from './form-controls.pipe';
export * from './form-errors.pipe';
