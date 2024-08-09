import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrBlank } from '@shared/utils';

@Pipe({
    name: 'formatParticipantName',
})
export class FormatParticipantNamePipe implements PipeTransform {
    transform(lastName?: string, firstName?: string): string {
        const firstNameValidated = firstName || '';
        const lastNameValidated = lastName || '';
        return `${lastNameValidated}${!isNullOrBlank(lastNameValidated) ? ', ' : ''}${firstNameValidated}`;
    }
}
