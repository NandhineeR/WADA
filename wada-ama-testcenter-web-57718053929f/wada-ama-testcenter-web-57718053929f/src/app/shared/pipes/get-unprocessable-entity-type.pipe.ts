import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationMap, TranslationService } from '@core/services';
import { isNullOrBlank } from '@shared/utils';

@Pipe({
    name: 'getUnprocessableEntityType',
})
export class GetUnprocessableEntityTypePipe implements PipeTransform {
    constructor(private translationService: TranslationService) {}

    transform(translations$: Observable<TranslationMap>, key: string, shortName: string): Observable<string> {
        const keyUpdated = isNullOrBlank(shortName) ? key : shortName;
        return translations$.pipe(
            map(
                (translations: TranslationMap) =>
                    translations[this.translationService.getUnprocessableEntityTypeKey(keyUpdated.toString())]
            )
        );
    }
}
