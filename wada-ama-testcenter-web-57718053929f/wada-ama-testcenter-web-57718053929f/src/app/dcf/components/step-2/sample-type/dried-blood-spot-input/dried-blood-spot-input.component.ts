import { Component, forwardRef, OnInit } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { controlHasModeRelatedErrors } from '@shared/utils/form-util';
import { trigger } from '@angular/animations';
import { DELAYED_FADE_IN, FADE_OUT } from '@core/components/animation/animation.component';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import { BaseSampleInput } from '@dcf/utils/base-sample/base-sample-input.directive';

export const DRIED_BLOOD_SPOT_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DriedBloodSpotInputComponent),
    multi: true,
};

@Component({
    selector: 'app-dried-blood-spot-input',
    templateUrl: './dried-blood-spot-input.component.html',
    styleUrls: ['./dried-blood-spot-input.component.scss'],
    providers: [DRIED_BLOOD_SPOT_INPUT_VALUE_ACCESSOR],
    animations: [trigger('fadeInOut', [DELAYED_FADE_IN, FADE_OUT])],
})
export class DriedBloodSpotInputComponent extends BaseSampleInput implements OnInit {
    constructor(private controlContainer: ControlContainer, store: Store<fromRootStore.IState>) {
        super(store);
        this.form = this.controlContainer.control as FormGroup;
    }

    ngOnInit(): void {
        this.form = this.controlContainer.control as FormGroup;
    }

    get manufacturerKit(): AbstractControl | null {
        if (this.form) {
            return this.form.get('manufacturerKit');
        }
        return null;
    }

    get manufacturerKitHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.manufacturerKit,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.manufacturerKit?.errors?.required
        );
    }
}
