import { Component, Input } from '@angular/core';
import { Analysis } from '@tdssa/models';
import { TranslationService } from '@core/services';

@Component({
    selector: 'app-progressbar-tooltip',
    templateUrl: './progressbar-tooltip.component.html',
    styleUrls: ['./progressbar-tooltip.component.scss'],
})
export class ProgressbarTooltipComponent {
    @Input() analysis = new Analysis();

    @Input() total = 0;

    @Input() sportName = '';

    translations$ = this.translationService.translations$;

    constructor(private translationService: TranslationService) {}
}
