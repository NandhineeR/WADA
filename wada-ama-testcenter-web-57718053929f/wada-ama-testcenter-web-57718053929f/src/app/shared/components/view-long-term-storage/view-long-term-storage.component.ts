import { Component, Input } from '@angular/core';
import { LongTermStorage } from '@sampleManagement/models';

@Component({
    selector: 'app-view-long-term-storage',
    templateUrl: './view-long-term-storage.component.html',
    styleUrls: ['./view-long-term-storage.component.scss'],
})
export class ViewLongTermStorageComponent {
    @Input() ltsRequest: LongTermStorage | null = null;

    @Input() isSampleInfo = false;
}
