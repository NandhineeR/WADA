import { Component, Input } from '@angular/core';
import { InfoBubbleSourceEnum } from '@shared/models';

@Component({
    selector: 'app-info-bubble',
    template: `
        <img [appTooltip]="tooltip" [src]="infoBubbleSource" />
        <ng-template #tooltip>
            <ng-content></ng-content>
        </ng-template>
    `,
    styles: [
        `
            img {
                margin-left: 5px;
                width: 20px;
                height: 20px;
            }
        `,
    ],
})
export class InfoBubbleComponent {
    @Input() infoBubbleSource = InfoBubbleSourceEnum.Green;
}
