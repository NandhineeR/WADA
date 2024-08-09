import { Component, Input } from '@angular/core';
import { TranslationService } from '@core/services';

@Component({
    selector: 'app-progressbar-with-tooltip',
    templateUrl: './progressbar-with-tooltip.component.html',
    styleUrls: ['./progressbar-with-tooltip.component.scss'],
})
export class ProgressbarWithTooltipComponent {
    @Input() sportName = '';

    @Input() type = '';

    @Input() icTotal = 0;

    @Input() ocTotal = 0;

    @Input() icForecast = 0;

    @Input() ocForecast = 0;

    @Input() isSample = true;

    @Input() isIc = true;

    translations$ = this.translationService.translations$;

    constructor(private translationService: TranslationService) {}

    get totalForecast(): number {
        return this.icForecast + this.ocForecast;
    }

    get displayAlone(): boolean {
        return this.isIc ? this.icForecast === 0 : this.ocForecast === 0;
    }

    get total(): number {
        return this.icTotal + this.ocTotal;
    }

    get competitionForecastTotal(): number {
        return this.isIc ? this.icForecast : this.ocForecast;
    }

    get competitionTotal(): number {
        return this.isIc ? this.icTotal : this.ocTotal;
    }
}
