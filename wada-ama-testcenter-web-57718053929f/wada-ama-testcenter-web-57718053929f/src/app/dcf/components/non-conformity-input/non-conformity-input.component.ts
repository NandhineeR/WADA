import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR,
    Validators,
} from '@angular/forms';
import { trigger } from '@angular/animations';
import { NonConformity } from '@dcf/models';
import { controlHasModeRelatedErrors, ValidationCategory, withCategory } from '@shared/utils/form-util';
import { DCFFormControls, FieldsSecurity, ListItem, StatusEnum } from '@shared/models';
import { FADE_IN, FADE_OUT } from '@core/components/animation/animation.component';

export const NON_CONFORMITY_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NonConformityInputComponent),
    multi: true,
};

@Component({
    selector: 'app-non-conformity-input',
    templateUrl: './non-conformity-input.component.html',
    styleUrls: ['./non-conformity-input.component.scss'],
    providers: [NON_CONFORMITY_INPUT_VALUE_ACCESSOR],
    animations: [trigger('fadeInOut', [FADE_IN, FADE_OUT])],
})
export class NonConformityInputComponent implements AfterViewInit, ControlValueAccessor {
    readonly controls = DCFFormControls;

    @ViewChild('deleteNonConformity', { static: true })
    deleteButton?: ElementRef;

    @Output()
    readonly deleteNonConformity: EventEmitter<number> = new EventEmitter<number>();

    @Input() dcfStatus: StatusEnum | undefined = undefined;

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    @Input() formGroup: FormGroup = new FormGroup({});

    @Input() inCreation = false;

    @Input() isEditMode = false;

    @Input() isMultipleDCF = false;

    @Input() nonConformityCategories?: ListItem;

    @Input() nonConformityIndex = -1;

    @Input() showErrors = false;

    private _nonConformity: NonConformity = new NonConformity();

    private onChange: any;

    private onTouched: any;

    ngAfterViewInit(): void {
        setTimeout(() => this.deleteButton && this.deleteButton.nativeElement.focus());
    }

    onDeleteNonConformity(): void {
        this.deleteNonConformity.emit(this.nonConformityIndex);
    }

    registerOnChange(onChange: any): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    writeValue(nonConformity: any): void {
        this.formGroup.patchValue(nonConformity);
        this._nonConformity.description = nonConformity;
    }

    static buildFormGroup(): FormGroup {
        return new FormGroup({
            category: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            description: new FormControl('', []),
        });
    }

    private isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    get categoryOfNonConformity(): AbstractControl | null {
        return this.formGroup?.get('category') || null;
    }

    get categoryOfNonConformityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.categoryOfNonConformity,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.categoryOfNonConformity?.errors?.required
        );
    }

    get nonConformity(): NonConformity {
        return this._nonConformity;
    }
}
