import { Pipe, PipeTransform } from '@angular/core';
import { TDPRow, TDPSubRow } from '@tdp/models';

@Pipe({
    name: 'disciplinesNotDeleted',
})
export class DisciplinesNotDeletedPipe implements PipeTransform {
    transform(row: TDPRow): Array<TDPSubRow> {
        return row.subRows.filter((disc) => !disc.isDeleted);
    }
}
