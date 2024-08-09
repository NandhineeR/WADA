import { Pipe, PipeTransform } from '@angular/core';
import { propsUndefined } from '@shared/utils/object-util';

@Pipe({
    name: 'propsUndefined',
})
export class PropsUndefinedPipe implements PipeTransform {
    transform(data: any): boolean {
        return propsUndefined(data);
    }
}
