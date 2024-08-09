import { Component } from '@angular/core';
import { DriedBloodSpotUtils } from '@dcf/models';
import { BaseSample } from '@dcf/utils/base-sample/base-sample.directive';

@Component({
    selector: 'app-dried-blood-spot-sample-view',
    styleUrls: ['../sample-input.component.scss'],
    templateUrl: './dried-blood-spot-sample-view.component.html',
})
export class DriedBloodSpotSampleViewComponent extends BaseSample {
    readonly fields = DriedBloodSpotUtils.requiredFields;
}
