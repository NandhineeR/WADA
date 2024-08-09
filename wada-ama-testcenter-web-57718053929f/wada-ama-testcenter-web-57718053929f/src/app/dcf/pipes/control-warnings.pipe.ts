import { Pipe, PipeTransform } from '@angular/core';
import { ValidationCategory } from '@shared/utils/form-util';

@Pipe({
    name: 'controlWarnings',
    pure: false,
})
export class FormControlWarningsPipe implements PipeTransform {
    transform(value: any): any {
        if (value && value.invalid) {
            return Object.values(value.errors || {})
                .map((error: any) => error.category)
                .includes(ValidationCategory.Warning);
        }
        return false;
    }
}
