import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationMap, TranslationService } from '@core/services';

@Pipe({
    name: 'getToasterMessage',
})
export class GetToasterMessagePipe implements PipeTransform {
    constructor(private translationService: TranslationService) {}

    transform(translations$: Observable<TranslationMap>, key: string): Observable<string> {
        return translations$.pipe(
            map(
                (translations: TranslationMap) =>
                    translations[this.translationService.getToasterMessageKey(key.toString())]
            )
        );
    }
}
