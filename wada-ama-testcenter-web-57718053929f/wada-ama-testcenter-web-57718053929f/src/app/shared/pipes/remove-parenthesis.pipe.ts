import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'removeParenthesis',
})
export class RemoveParenthesisPipe implements PipeTransform {
    transform(incomingString: string): string {
        return incomingString.replace(/[()]/g, '');
    }
}
