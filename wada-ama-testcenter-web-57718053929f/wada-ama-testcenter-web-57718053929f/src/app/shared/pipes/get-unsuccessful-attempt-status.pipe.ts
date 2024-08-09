import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationMap, TranslationService } from '@core/services';
import { UAStatus } from '@to/models/enums';

@Pipe({
    name: 'getUnsuccessfulAttemptStatus',
})
export class GetUnsuccessfulAttemptStatusPipe implements PipeTransform {
    constructor(private translationService: TranslationService) {}

    transform(translations$: Observable<TranslationMap>, key: UAStatus): Observable<string> {
        return translations$.pipe(
            map(
                (translations: TranslationMap) =>
                    translations[this.translationService.getUnsuccessfulAttemptStatusKey(UAStatus[key])]
            )
        );
    }
}
