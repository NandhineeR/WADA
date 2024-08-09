import { Pipe, PipeTransform } from '@angular/core';

/*
 * Pipe to stringify an object in html
 * Usage: 'my-object-with-to-string'
 * Returns: 'my-object-in-string'
 */
@Pipe({
    name: 'toString',
})
export class ToStringPipe implements PipeTransform {
    transform(obj: any): string {
        return obj.toString();
    }
}
