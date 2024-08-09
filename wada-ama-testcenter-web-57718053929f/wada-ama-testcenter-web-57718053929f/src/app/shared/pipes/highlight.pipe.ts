import { Pipe, PipeTransform } from '@angular/core';
import { highlightToken } from '@shared/utils/string-utils';

/*
 * Pipe for highlighting part of a string in html
 * Usage: 'my-string-with-token-inside' | highlight:token
 * Returns: 'my-string-with-<strong>token</strong>-inside
 */
@Pipe({
    name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
    transform(str: string, token: string): string {
        return highlightToken(str, token);
    }
}
