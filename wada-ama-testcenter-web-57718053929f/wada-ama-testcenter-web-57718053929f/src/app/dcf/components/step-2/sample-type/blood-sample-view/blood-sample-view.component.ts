import { Component } from '@angular/core';
import { BloodUtils } from '@dcf/models';
import { BaseSample } from '@dcf/utils/base-sample/base-sample.directive';

@Component({
    selector: 'app-blood-sample-view',
    styleUrls: ['../sample-input.component.scss'],
    templateUrl: './blood-sample-view.component.html',
})
export class BloodSampleViewComponent extends BaseSample {
    readonly fields = BloodUtils.requiredFields;
}
