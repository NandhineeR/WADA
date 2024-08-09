import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'trim',
})
export class TrimPipe implements PipeTransform {
    transform(description: string): string {
        return description?.trim() || '';
    }
}
