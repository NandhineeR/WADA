import { Pipe, PipeTransform } from '@angular/core';
import { hasPipeErrors } from '@shared/utils/form-util';
import { StatusEnum } from '@shared/models';

@Pipe({
    name: 'controlErrors',
    pure: false,
})
export class FormControlErrorsPipe implements PipeTransform {
    transform(value: any, showErrors: boolean, dcfStatus: StatusEnum, key: string): any {
        return this.errorsByName(value, showErrors, dcfStatus, key);
    }

    errorsByName(controls: any, showErrors: boolean, dcfStatus: StatusEnum, key: string): boolean {
        let hasError = false;
        if (controls) {
            const existInRoot = Object.keys(controls).find((control: string) => control === key);
            if (existInRoot) {
                hasError = hasPipeErrors(controls[existInRoot], showErrors, dcfStatus);
            } else {
                const childKeys: Array<string> = Object.keys(controls); // list of control's key
                hasError = childKeys.reduce((error: boolean, controlkey: string) => {
                    const childControl = controls[controlkey] && controls[controlkey].controls;
                    return (
                        error || (childControl ? this.errorsByName(childControl, showErrors, dcfStatus, key) : false)
                    );
                }, false);
            }
        }
        return hasError;
    }
}
