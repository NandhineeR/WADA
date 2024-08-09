import { Pipe, PipeTransform } from '@angular/core';
import { formatDisplayDateWithTimeUTC } from '@shared/utils';

@Pipe({
    name: 'formatDatetimeUTC',
})
export class FormatDatetimeUTCPipe implements PipeTransform {
    transform(date: Date | null): string {
        return formatDisplayDateWithTimeUTC(date);
    }
}
