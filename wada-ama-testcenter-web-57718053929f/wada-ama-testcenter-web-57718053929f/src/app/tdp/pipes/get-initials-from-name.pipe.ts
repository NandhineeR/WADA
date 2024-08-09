import { Pipe, PipeTransform } from '@angular/core';
import { User } from '@tdp/models';

@Pipe({
    name: 'getInitials',
})
export class GetInitialsFromNamePipe implements PipeTransform {
    transform(user: User): string {
        return user.getInitials();
    }
}
