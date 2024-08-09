import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { controlHasModeRelatedErrors } from '@shared/utils/form-util';
import { trigger } from '@angular/animations';
import { DELAYED_FADE_IN, FADE_OUT } from '@core/components/animation/animation.component';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import { ParticipantInputComponent } from '@shared/components';
import { Participant } from '@shared/models';
import { BaseSampleInput } from '@dcf/utils/base-sample/base-sample-input.directive';
import { isNullOrBlank } from '@shared/utils/string-utils';

export const BLOOD_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BloodInputComponent),
    multi: true,
};

@Component({
    selector: 'app-blood-input',
    templateUrl: './blood-input.component.html',
    styleUrls: ['./blood-input.component.scss'],
    providers: [BLOOD_INPUT_VALUE_ACCESSOR],
    animations: [trigger('fadeInOut', [DELAYED_FADE_IN, FADE_OUT])],
})
export class BloodInputComponent extends BaseSampleInput implements OnInit {
    @ViewChild('bloodCollectionOfficialParticipantInput')
    bloodCollectionOfficialParticipantInput?: ParticipantInputComponent;

    @Input() bloodCollectionOfficials: Array<Participant> = [];

    constructor(private controlContainer: ControlContainer, store: Store<fromRootStore.IState>) {
        super(store);
        this.form = this.controlContainer.control as FormGroup;
    }

    ngOnInit(): void {
        this.form = this.controlContainer.control as FormGroup;
    }

    get bloodCollectionOfficial(): AbstractControl | null {
        return this.form.get('bloodCollectionOfficial');
    }

    get bloodCollectionOfficialHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.bloodCollectionOfficial,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.bloodCollectionOfficial?.errors?.lastNameRequired ||
                this.bloodCollectionOfficial?.errors?.firstNameRequired
        );
    }

    get bloodCollectionOfficialHasFirstNameErrors(): boolean {
        return (
            ((this.bloodCollectionOfficialParticipantInput?.isFirstNameTouched ||
                (this.isDCFCompleted() && this.bloodCollectionOfficialHasErrors)) &&
                this.bloodCollectionOfficial?.errors?.firstNameRequired) ||
            (!this.inCreation &&
                this.bloodCollectionOfficial?.errors?.firstNameRequired &&
                isNullOrBlank(this.bloodCollectionOfficial?.value?.firstName))
        );
    }

    get bloodCollectionOfficialHasLastNameErrors(): boolean {
        return (
            ((this.bloodCollectionOfficialParticipantInput?.isLastNameTouched ||
                (this.isDCFCompleted() && this.bloodCollectionOfficialHasErrors)) &&
                this.bloodCollectionOfficial?.errors?.lastNameRequired) ||
            (!this.inCreation &&
                this.bloodCollectionOfficial?.errors?.lastNameRequired &&
                isNullOrBlank(this.bloodCollectionOfficial?.value?.lastName))
        );
    }
}
