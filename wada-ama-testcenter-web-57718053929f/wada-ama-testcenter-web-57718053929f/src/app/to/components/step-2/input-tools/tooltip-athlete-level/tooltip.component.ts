import { Component } from '@angular/core';
import { InfoBubbleSourceEnum } from '@shared/models';

@Component({
    selector: 'app-tooltip-athlete-level',
    template: ` <app-info-bubble i18n="@@athleteLevelToTooltip" [infoBubbleSource]="infoBubbleSource"
        >Indicating that this athlete is defined as an 'International or 'National' level athlete will ensure that the
        test is applied to TDSSA calculations
    </app-info-bubble>`,
})
export class ToolTipComponent {
    infoBubbleSource = InfoBubbleSourceEnum.Green;
}
