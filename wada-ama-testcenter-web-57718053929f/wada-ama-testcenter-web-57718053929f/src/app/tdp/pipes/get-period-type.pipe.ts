import { Pipe, PipeTransform } from '@angular/core';
import { Period, PeriodType, TDPSheetInfo } from '@tdp/models';

@Pipe({
    name: 'getPeriodType',
})
export class GetPeriodTypePipe implements PipeTransform {
    transform(input: Period | TDPSheetInfo): string {
        const period = input instanceof TDPSheetInfo ? input.getPeriod() : input;
        return PeriodType[period.getType()].toLowerCase();
    }
}
