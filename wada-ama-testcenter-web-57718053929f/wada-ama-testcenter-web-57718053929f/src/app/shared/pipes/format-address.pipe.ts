import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '@shared/models';

@Pipe({
    name: 'formatAddress',
})
export class FormatAddressPipe implements PipeTransform {
    transform(address?: Address): string {
        if (!address) {
            return '';
        }
        const fields = [
            address.streetAddress1,
            address.streetAddress2,
            address.building,
            address.floor,
            address.room,
            address.city,
            address.region && address.region.name,
            address.country && address.country.name,
            address.zipCode,
        ];

        return fields
            .map((field) => field?.trim() || field)
            .filter(Boolean)
            .join(', ');
    }
}
