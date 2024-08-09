import { Pipe, PipeTransform } from '@angular/core';
import { Period, Quarter, TDPSheetInfo } from '@tdp/models';

@Pipe({
    name: 'getQuarter',
})
export class GetQuarterPipe implements PipeTransform {
    transform(input: Period | TDPSheetInfo): string {
        const period = input instanceof TDPSheetInfo ? input.getPeriod() : input;
        return Quarter[period.getQuarter()].toLowerCase();
    }
}
