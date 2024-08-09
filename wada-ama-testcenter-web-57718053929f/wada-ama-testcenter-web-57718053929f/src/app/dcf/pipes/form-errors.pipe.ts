import { Pipe, PipeTransform } from '@angular/core';
import { hasPipeErrors } from '@shared/utils/form-util';
import { StatusEnum } from '@shared/models';

@Pipe({
    name: 'formErrors',
    pure: false,
})
export class FormErrorsPipe implements PipeTransform {
    transform(value: any, showErrors: boolean, dcfStatus: StatusEnum): any {
        return this.errors(value, showErrors, dcfStatus);
    }

    errors(controls: any, showErrors: boolean, dcfStatus: StatusEnum): boolean {
        let hasError = false;
        if (controls) {
            const controlsToValidate = controls.controls || controls;
            hasError = this.hasErrors(controlsToValidate, showErrors, dcfStatus);
        }
        return hasError;
    }

    private hasErrors(controls: any, showErrors: boolean, dcfStatus: StatusEnum) {
        const parentKeys: Array<string> = Object.keys(controls);
        return parentKeys.reduce((error: boolean, controlkey: string) => {
            const control = controls[controlkey] && controls[controlkey].controls;
            return (
                error ||
                (control
                    ? this.errors(control, showErrors, dcfStatus)
                    : hasPipeErrors(controls[controlkey], showErrors, dcfStatus))
            );
        }, false);
    }
}
