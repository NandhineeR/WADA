import { Pipe, PipeTransform } from '@angular/core';
import { formatDisplayDate } from '@shared/utils';

@Pipe({
    name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
    transform(date: Date | null, utcOffset: string, format: string): string {
        return formatDisplayDate(date, utcOffset, format);
    }
}
