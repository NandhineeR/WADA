import { Pipe, PipeTransform } from '@angular/core';
import { TDPRow } from '@tdp/models';

@Pipe({
    name: 'hasOnlyDisabledRows',
})
export class HasOnlyDisabledRowsPipe implements PipeTransform {
    transform(rows: Array<TDPRow>): boolean {
        let hasOnlyDisabledRows = true;
        rows.forEach((row) => {
            if (!row.isDisabled) {
                hasOnlyDisabledRows = false;
            }
        });
        return hasOnlyDisabledRows;
    }
}
