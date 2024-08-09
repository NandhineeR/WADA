import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { DCFFormControls, FieldsSecurity, StatusEnum } from '@shared/models';
import {
    controlHasModeRelatedErrors,
    takeFirstError,
    validateEmail,
    ValidationCategory,
    withCategory,
} from '@shared/utils';

/**
 * Component responsible for displaying form control with email address information
 */
@Component({
    selector: 'app-email-input',
    templateUrl: './email-input.component.html',
    styleUrls: ['./email-input.component.scss'],
})
export class EmailInputComponent implements OnInit {
    @Input() form: FormGroup | null = null;

    @Input() showErrors = false;

    @Input() inCreation = false;

    @Input() dcfStatus?: StatusEnum;

    @Input() isMultipleDCF = false;

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    @Input() isEditMode = false;

    editEmailAddress = false;

    emailHasValue = false;

    tempEmail = '';

    controls = DCFFormControls;

    ngOnInit(): void {
        if (this.emailNotProvided) {
            this.onEmailNotProvided(this.emailNotProvided.value);
        }
    }

    onEditEmailAddress(): void {
        this.editEmailAddress = true;
    }

    onEmailNotProvided(notProvided: boolean): void {
        const validators = notProvided
            ? []
            : [
                  takeFirstError(
                      withCategory(Validators.required, ValidationCategory.Mandatory),
                      withCategory(validateEmail, ValidationCategory.Format)
                  ),
              ];
        if (this.email) {
            if (this.email.value !== '') {
                this.tempEmail = this.email.value;
            }
            if (notProvided) {
                this.email.patchValue('');
            } else {
                this.email.patchValue(this.tempEmail);
            }
            this.email.setValidators(validators);
            this.email.updateValueAndValidity();
        }
    }

    private isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    get email(): AbstractControl | null {
        if (this.form) {
            return this.form.get('email');
        }
        return null;
    }

    get emailNotProvided(): AbstractControl | null {
        if (this.form) {
            return this.form.get('emailNotProvided');
        }
        return null;
    }

    get emailHasErrors(): boolean {
        return (
            (!this.emailNotProvided?.value &&
                this.email?.touched &&
                (this.email.invalid || this.email.value.trim() <= 0)) ||
            controlHasModeRelatedErrors(
                this.email,
                this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
                this.inCreation,
                this.email?.errors?.required
            )
        );
    }
}
