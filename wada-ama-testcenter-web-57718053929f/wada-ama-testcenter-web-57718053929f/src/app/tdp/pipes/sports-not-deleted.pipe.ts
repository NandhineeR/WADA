import { Pipe, PipeTransform } from '@angular/core';
import { TDPRow, TDPSheetInfo, TDPSubRow } from '@tdp/models';

@Pipe({
    name: 'sportsNotDeleted',
})
export class SportsNotDeletedPipe implements PipeTransform {
    transform(sheet: TDPSheetInfo): Array<TDPRow> {
        return sheet.rows.filter((sport) => disciplinesNotDeleted(sport).length > 0);
    }
}

function disciplinesNotDeleted(sport: TDPRow): Array<TDPSubRow> {
    return sport.subRows.filter((disc) => !disc.isDeleted);
}
