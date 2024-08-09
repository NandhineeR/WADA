import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationMap, TranslationService } from '@core/services';

@Pipe({
    name: 'getAthleteSelected',
})
export class GetAthleteSelectedPipe implements PipeTransform {
    readonly SINGULAR: string = 'singular';

    readonly PLURAL: string = 'plural';

    constructor(private translationService: TranslationService) {}

    transform(translations$: Observable<TranslationMap>, selectedCount: number): Observable<string> {
        return translations$.pipe(
            map((translations: TranslationMap) =>
                selectedCount > 1
                    ? translations[this.translationService.getAthleteSelectedKey(this.PLURAL.toString())]
                    : translations[this.translationService.getAthleteSelectedKey(this.SINGULAR.toString())]
            )
        );
    }
}
