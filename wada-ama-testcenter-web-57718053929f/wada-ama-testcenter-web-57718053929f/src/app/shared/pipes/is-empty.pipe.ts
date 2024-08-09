import { Pipe, PipeTransform } from '@angular/core';
import { IsEmpty } from '@shared/models';

@Pipe({
    name: 'isEmpty',
})
export class IsEmptyPipe implements PipeTransform {
    transform(data: IsEmpty): boolean {
        return data.isEmpty();
    }
}
