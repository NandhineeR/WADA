import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formControlKeys',
    pure: false,
})
export class FormControlKeysPipe implements PipeTransform {
    transform(value: any): any {
        return this.getKeys(value.controls, []);
    }

    getKeys(controls: any, controlName: Array<string>): Array<string> {
        if (controls) {
            const parentKeys: Array<string> = Object.keys(controls);
            parentKeys.forEach((parentKey: string) => {
                const parentControl = controls[parentKey].controls;
                if (parentControl) {
                    const keys: Array<string> = Object.keys(parentControl);
                    keys.forEach((key: string) => {
                        if (parentControl[key].controls) {
                            this.getKeys(parentControl[key], controlName);
                        } else {
                            controlName.push(key);
                        }
                    });
                } else {
                    controlName.push(parentKey);
                }
            });
        }
        return controlName;
    }
}
