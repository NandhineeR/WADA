import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationMap, TranslationService } from '@core/services';

@Pipe({
    name: 'getParticipantType',
})
export class GetParticipantTypePipe implements PipeTransform {
    constructor(private translationService: TranslationService) {}

    transform(translations$: Observable<TranslationMap>, key: string): Observable<string> {
        return translations$.pipe(
            map(
                (translations: TranslationMap) =>
                    translations[this.translationService.getParticipantTypeKey(key.toString().toLowerCase())]
            )
        );
    }
}
