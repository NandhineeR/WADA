import { Component, Input } from '@angular/core';
import { QuickTurnAround } from '@sampleManagement/models';

@Component({
    selector: 'app-view-quick-turn-around',
    templateUrl: './view-quick-turn-around.component.html',
    styleUrls: ['./view-quick-turn-around.component.scss'],
})
export class ViewQuickTurnAroundComponent {
    @Input() isSampleInfo = false;

    @Input() qtaRequest: QuickTurnAround | null = null;
}
