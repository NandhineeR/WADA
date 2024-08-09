import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'displayDescriptionName',
})
export class DisplayDescriptionNamePipe implements PipeTransform {
    transform(description: string, name: string): string {
        const tempName = (name || '').trim();
        const tempDesc = (description || '').trim();
        return tempName && tempDesc ? `${tempName} - ${tempDesc}` : `${tempName}${tempDesc}`;
    }
}
