import { Pipe, PipeTransform } from '@angular/core';
import { Period, TDPSheetInfo } from '@tdp/models';

@Pipe({
    name: 'getPeriod',
})
export class GetPeriodPipe implements PipeTransform {
    transform(tdpSheetInfo: TDPSheetInfo): Period {
        return tdpSheetInfo.getPeriod();
    }
}
