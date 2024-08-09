import { Pipe, PipeTransform } from '@angular/core';
import { TDPRow } from '@tdp/models';

@Pipe({
    name: 'hasDisabledRows',
})
export class HasDisabledRowsPipe implements PipeTransform {
    transform(rows: Array<TDPRow>): boolean {
        let hasDisabledRows = false;
        rows.forEach((row) => {
            if (row.isDisabled) {
                hasDisabledRows = true;
            }
        });
        return hasDisabledRows;
    }
}
