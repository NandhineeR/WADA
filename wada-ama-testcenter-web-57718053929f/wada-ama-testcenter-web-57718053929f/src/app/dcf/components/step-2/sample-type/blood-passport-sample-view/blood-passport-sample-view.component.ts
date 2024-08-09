import { Component } from '@angular/core';
import { BloodPassportUtils } from '@dcf/models';
import { BaseSample } from '@dcf/utils/base-sample/base-sample.directive';

@Component({
    selector: 'app-blood-passport-sample-view',
    templateUrl: './blood-passport-sample-view.component.html',
    styleUrls: ['./blood-passport-sample-view.component.scss'],
})
export class BloodPassportSampleViewComponent extends BaseSample {
    readonly fields = BloodPassportUtils.requiredFields;
}
