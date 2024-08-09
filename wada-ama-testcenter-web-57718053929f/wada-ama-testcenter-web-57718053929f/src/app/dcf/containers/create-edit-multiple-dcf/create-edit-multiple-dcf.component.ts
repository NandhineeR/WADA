import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import { ConfirmLeaveService } from '@shared/services';
import { ConfirmLeaveComponent } from '@shared/components';
import { select, Store } from '@ngrx/store';
import {
    DCF,
    DCF_STATUS_COMPLETED,
    DCFForm,
    IMultipleDCFCreateEdit,
    Sample,
    ProceduralInformation,
    Timezone,
    UrineSampleBoundaries,
} from '@dcf/models';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    controlHasModeRelatedErrors,
    fieldNotEmpty,
    fieldRequired,
    hasBlockingErrors,
    numberOfErrorsPerCategory,
    takeFirstError,
    validateDateFormat,
    validateEmail,
    ValidationCategory,
    withCategory,
    zipCodeRegex,
} from '@shared/utils';
import {
    Address,
    FieldsSecurity,
    LocalizedEntity,
    Participant,
    SampleTypeEnum,
    SportDiscipline,
    ErrorMessageKeyEnums,
    CountryWithRegions,
} from '@shared/models';
import { trigger } from '@angular/animations';
import { FADE_OUT } from '@core/components/animation/animation.component';
import { MultipleDCFFormComponent, SampleInputComponent } from '@dcf/components';
import { ConflictException } from '@core/models';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromStore from '@dcf/store';
import { TranslationService } from '@core/services/translation.service';
import { mapDCFFromForm } from '@dcf/mappers';
import { isSampleReadOnly, removeUndefinedProperties } from '@dcf/utils/sample-validation.utils';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';

@Component({
    selector: 'app-create-edit-multiple-dcf',
    templateUrl: './create-edit-multiple-dcf.component.html',
    styleUrls: ['./create-edit-multiple-dcf.component.scss'],
    animations: [trigger('fadeOut', [FADE_OUT])],
})
export class CreateEditMultipleDCFComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly DCF_STATUS_COMPLETED = DCF_STATUS_COMPLETED;

    @ViewChild('cancelCreateModalRef')
    cancelCreateModalRef?: ConfirmLeaveComponent;

    @ViewChild('confirmLeaveModalRef')
    confirmLeaveModalRef?: ConfirmLeaveComponent;

    @ViewChildren(MultipleDCFFormComponent)
    formComponents?: QueryList<MultipleDCFFormComponent>;

    bloodCollectionOfficials$: Observable<Array<Participant>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesBloodOfficials
    );

    chaperones$: Observable<Array<Participant>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesNotifyingChaperones
    );

    coaches$: Observable<Map<string, Array<Participant>>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesCoachMap
    );

    countries$: Observable<Array<CountryWithRegions>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesCountriesWithRegions
    );

    displaySaved$: Observable<boolean> = this.store.select(fromStore.getMultipleDCFIsAllDCFsSaved);

    doctors$: Observable<Map<string, Array<Participant>>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesDoctorMap
    );

    error$: Observable<boolean> = this.store.select(fromStore.getMultipleDCFGlobalError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getMultipleDCFErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    hasSampleCodeError$: Observable<boolean> = this.store.select(fromStore.getMultipleDCFHasSampleCodeError);

    loading$: Observable<boolean> = this.store.select(fromStore.getMultipleDCFGlobalLoading);

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    manufacturers$: Observable<Array<LocalizedEntity>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesManufacturers
    );

    multipleDCFsFieldsSecurity$: Observable<Map<string, FieldsSecurity> | null> = this.store.select(
        fromStore.getMultipleDCFFieldsSecurity
    );

    multipleDcfConflictException$: Observable<ConflictException | null> = this.store.select(
        fromStore.getMultipleDCFConflictException
    );

    sampleDuplicateException$: Observable<Map<string, string> | null> = this.store.select(
        fromStore.getMultipleDCFSampleDuplicateException
    );

    saveError$: Observable<boolean> = this.store.select(fromStore.getMultipleDCFSaveError);

    sportsDisciplines$: Observable<Array<SportDiscipline>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesSportDisciplines)
    );

    timezones$: Observable<Array<Timezone>> = this.store.select(fromAutoCompletesStore.getAutoCompletesTimezones);

    translations$ = this.translationService.translations$;

    urineSampleBoundaries$: Observable<UrineSampleBoundaries | null> = this.store.select(
        fromStore.getMultipleDCFUrineSampleBoundaries
    );

    viewModels: Array<IMultipleDCFCreateEdit> | undefined = [];

    witnessChaperones$: Observable<Array<Participant>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesWitnessChaperones
    );

    activeFromUrl = '';

    currentDcfId: number | null = null;

    hasBeenOpened: Set<string> = new Set<string>();

    ids: Array<string> = new Array<string>();

    isActive = false;

    isCreationMode = false;

    isEditMode = false;

    openedFromView = false;

    readonlySample: Array<boolean> = [];

    sampleCodeValidation = false;

    showErrors = false;

    private currentTestId: string | undefined;

    private subscriptions = new Subscription();

    private validatedTestIds: Array<string> = [];

    constructor(
        private store: Store<fromRootStore.IState>,
        private confirmLeaveService: ConfirmLeaveService,
        private translationService: TranslationService
    ) {}

    ngAfterViewInit(): void {
        this.confirmLeaveService.confirmLeaveComponent = this.confirmLeaveModalRef;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                this.isEditMode = this.isEdit(state.url);
                this.isCreationMode = this.isCreation(state.url);
                this.ids = state.queryParams && state.queryParams.id ? (state.queryParams.id as string).split(',') : [];
                this.activeFromUrl = state.queryParams?.active || '';
                if (this.activeFromUrl) {
                    this.openedFromView = true;
                }
                const payload = {
                    ids: this.parseIds(state.queryParams.id),
                };
                const action = this.isEditMode
                    ? fromStore.MultipleDCFInitEdit(payload)
                    : fromStore.MultipleDCFInitCreate(payload);
                this.store.dispatch(action);
            })
        );

        this.subscriptions.add(
            this.store
                .pipe(select(fromStore.getMultipleDCFForm))
                .pipe(
                    filter((dcfForms: Array<DCFForm>) => dcfForms && dcfForms.length > 0 && !this.sampleCodeValidation),
                    withLatestFrom(this.store.pipe(select(fromStore.getMultipleDCFAllDCFs)))
                )
                .subscribe(([dcfForms, dcfs]: [Array<DCFForm>, Array<DCF>]) =>
                    this.setMultipleDCFModelData(dcfForms, dcfs)
                )
        );
    }

    cancel(): void {
        this.showCancelCreateModal();
    }

    /**
     * Initializes fields and sets validators
     */
    buildForm(dcfForm: DCFForm): FormGroup {
        const mandatoryValidator = withCategory(Validators.required, ValidationCategory.Mandatory);
        const formatValidator = withCategory(validateDateFormat, ValidationCategory.Format);
        const mandatoryFirstAndLastName = [
            withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
            withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
        ];
        const emailValidator = withCategory(validateEmail, ValidationCategory.Format);
        const form = new FormGroup({
            id: new FormControl(dcfForm.id, []),
            testId: new FormControl(dcfForm.testId, []),
            email: new FormControl(dcfForm.email, {
                updateOn: 'blur',
                validators: [takeFirstError(mandatoryValidator), emailValidator],
            }),
            emailNotProvided: new FormControl(dcfForm.emailNotProvided, []),
            sportDiscipline: new FormControl(dcfForm.sportDiscipline, [mandatoryValidator]),
            notificationDate: new FormControl(dcfForm.notificationDate, [mandatoryValidator, formatValidator]),
            notificationTimezone: new FormControl(dcfForm.notificationTimezone || null),
            advanceNotice: new FormControl(false, []),
            notifyingChaperone: new FormControl(dcfForm.notifyingChaperone, mandatoryFirstAndLastName),
            coach: new FormControl(dcfForm.coach, []),
            coachNotApplicable: new FormControl(dcfForm.coachNotApplicable, []),
            doctor: new FormControl(dcfForm.doctor, []),
            doctorNotApplicable: new FormControl(dcfForm.doctorNotApplicable, []),
            arrivalDate: new FormControl(dcfForm.arrivalDate, [mandatoryValidator, formatValidator]),
            arrivalTimezone: new FormControl(dcfForm.arrivalTimezone || null),
            feeForService: new FormControl(false, []),
            samples: this.setSamples(dcfForm.samples),
            dco: new FormControl(undefined, [
                withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
                withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
            ]),
            consentForResearch: new FormControl(undefined, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
        });

        const address = dcfForm.address || new Address();
        form.addControl(
            'address',
            new FormGroup({
                id: new FormControl(address.id, []),
                country: new FormControl(address.country, [mandatoryValidator]),
                streetAddress1: new FormControl(address.streetAddress1, []),
                streetAddress2: new FormControl(address.streetAddress2, []),
                building: new FormControl(address.building, []),
                floor: new FormControl(address.floor, []),
                room: new FormControl(address.room, []),
                city: new FormControl(address.city, [withCategory(fieldNotEmpty(), ValidationCategory.Mandatory)]),
                region: new FormControl(address.region, []),
                zipCode: new FormControl(address.zipCode, [
                    withCategory(Validators.pattern(zipCodeRegex), ValidationCategory.Format),
                ]),
            })
        );
        return form;
    }

    deleteAthlete(confirm: boolean, model: IMultipleDCFCreateEdit): void {
        if (confirm && this.viewModels) {
            const index = this.viewModels.indexOf(model, 0);
            if (index > -1) {
                this.viewModels.splice(index, 1);
                this.hasBeenOpened.delete(model.testId);
                this.ids.splice(this.ids.indexOf(model.testId, 0), 1);
                if (this.viewModels.length === 0) {
                    this.redirectOnConfirm(true);
                } else if (this.viewModels.length === 1) {
                    this.viewModels[0].active = true;
                }
            }
        }
    }

    executeSampleCodeValidation(testId: string): void {
        this.sampleCodeValidation = true;
        const dcfs: Array<DCF> = this.updateMultipleDCFs();
        const dcfToValidate = dcfs.find((dcf) => dcf.testId?.toString() === testId);
        if (dcfToValidate) {
            this.store.dispatch(fromStore.MultipleDCFSampleCodeValidation({ dcfs, dcf: dcfToValidate }));
        }
    }

    formArrayHasError(element: FormArray, status: string | undefined): boolean {
        let hasError = false;
        element.controls.forEach((el) => {
            hasError = hasError || this.redirectionHasErrors(el, status);
        });
        return hasError;
    }

    formGroupHasError(element: FormGroup, status: string | undefined): boolean {
        let hasError = false;
        Object.keys(element.controls).forEach((key: string) => {
            const control = element.controls[key];
            hasError = hasError || this.redirectionHasErrors(control, status);
        });
        return hasError;
    }

    formHasErrors(): boolean {
        let hasError = false;
        this.viewModels?.forEach((view: IMultipleDCFCreateEdit) => {
            Object.keys(view.form.controls).forEach((key: string) => {
                const control = view.form.controls[key];
                if (!hasError) {
                    hasError = hasError || this.redirectionHasErrors(control, view.status);
                }
            });
        });
        return hasError;
    }

    getUpdatedForm(testId: string): FormGroup | undefined {
        if (this.formComponents) {
            const dcfForms: FormGroup[] = [];

            this.formComponents.forEach((formComponent) => {
                const dcfForm = formComponent.getForm();
                dcfForms.push(dcfForm);
            });

            return dcfForms.find((form) => form.get('testId')?.value === testId);
        }

        return undefined;
    }

    isCreation(module: string): boolean {
        return module.includes('new');
    }

    isEdit(module: string): boolean {
        return module.includes('edit');
    }

    parseIds(param: any): Array<string> {
        return param && param.length <= 1 ? [param] : param;
    }

    redirectionHasErrors(control: any, status: string | undefined): boolean {
        let error = false;
        if (control instanceof FormArray) {
            error = this.formArrayHasError(control, status);
        } else if (control instanceof FormGroup) {
            error = this.formGroupHasError(control, status);
        } else if (this.isCreationMode) {
            error = controlHasModeRelatedErrors(control, true, false, false);
        } else {
            error =
                status === DCF_STATUS_COMPLETED
                    ? controlHasModeRelatedErrors(control, true, false, true)
                    : controlHasModeRelatedErrors(control, true, false, false);
        }
        return error;
    }

    redirectOnConfirm(redirect: boolean): void {
        if (redirect) {
            this.confirmLeaveService.confirmLeaveComponent = undefined; // prevent multiple confirmations from happening
            this.store.dispatch(
                fromStore.MultipleDCFCancel({
                    isEditMode: this.isEditMode,
                    dcfIds: this.ids,
                })
            );
        }
    }

    returnToFormAfterError(): void {
        this.store.dispatch(fromStore.MultipleDCFResetError());
    }

    saveAndReviewAll(): void {
        if (this.formComponents && this.viewModels) {
            const dcfData: Array<{ dcfForm: DCFForm; dcf: DCF }> = [];
            let hasError = false;

            this.viewModels.forEach((view: IMultipleDCFCreateEdit) => {
                const updatedForm = this.getUpdatedForm(view.testId)?.value;
                this.validateForm(view);

                const item: { dcfForm: DCFForm; dcf: DCF } = {
                    dcfForm: updatedForm || new DCFForm(),
                    dcf: view.data || new DCF(),
                };
                dcfData.push(item);
                if (hasBlockingErrors(view.errorsPerCategory)) {
                    hasError = true;
                }
            });
            this.showErrors = true;

            if (!hasError) {
                this.store.dispatch(fromStore.MultipleDCFSaveAll({ data: dcfData }));
            }
        }
    }

    setMultipleDCFModelData(dcfForms: Array<DCFForm>, dcfs: Array<DCF>): void {
        if (!this.currentTestId) {
            if (this.openedFromView) {
                this.showErrors = true;
                const activeForm = dcfForms.find(
                    (dcfForm: DCFForm) => dcfForm.id != null && dcfForm.id.toString() === this.activeFromUrl
                );
                if (activeForm) {
                    this.currentTestId = activeForm.testId;
                }
            } else {
                this.currentTestId = dcfForms[0].testId;
            }
        }

        this.viewModels = dcfForms
            .filter(
                (dcfform) =>
                    this.ids.includes(dcfform.testId) || this.ids.includes(dcfform.id ? dcfform.id.toString() : '')
            )
            .map((dcfForm: DCFForm) => this.mapDcfFormToDcfView(dcfForm, dcfForms, dcfs));
    }

    /**
     * Map from procedural information to step5FormValues
     * @param proceduralInformation: A procedural Information object
     */
    setProceduralInformation(proceduralInformation: ProceduralInformation | null): ProceduralInformation | undefined {
        if (proceduralInformation) {
            const sectionProceduralFormValue: ProceduralInformation = new ProceduralInformation();
            sectionProceduralFormValue.endOfProcedureDate = proceduralInformation.endOfProcedureDate;
            sectionProceduralFormValue.consentForResearch = proceduralInformation.consentForResearch;
            sectionProceduralFormValue.declarationOfSupplements = proceduralInformation.declarationOfSupplements;
            sectionProceduralFormValue.dco = proceduralInformation.dco;

            return sectionProceduralFormValue;
        }

        return undefined;
    }

    setSamples(samples: Array<Sample>): FormArray {
        const formArray = new FormArray([]);
        const urineSamples = samples.filter((sample) => sample.sampleTypeSpecificCode === SampleTypeEnum.Urine);
        const bloodSamples = samples.filter((sample) => sample.sampleTypeSpecificCode === SampleTypeEnum.Blood);
        const bloodPassportSamples = samples.filter(
            (sample) => sample.sampleTypeSpecificCode === SampleTypeEnum.BloodPassport
        );
        const driedBloodPassportSamples = samples.filter(
            (sample) => sample.sampleTypeSpecificCode === SampleTypeEnum.DriedBloodSpot
        );
        const samplesOrdered = [
            ...urineSamples,
            ...bloodSamples,
            ...bloodPassportSamples,
            ...driedBloodPassportSamples,
        ];

        samplesOrdered.forEach((value: Sample) => {
            const sample = SampleFactory.createSampleForForm(value);

            if (samples) {
                const formGroup = SampleInputComponent.buildFormGroup(sample);
                this.readonlySample.push(isSampleReadOnly(sample));
                const tempSample = removeUndefinedProperties(sample);
                formGroup.patchValue(tempSample);
                formArray.push(formGroup);
            }
        });
        return formArray;
    }

    showCancelCreateModal(): void {
        if (this.cancelCreateModalRef) {
            this.cancelCreateModalRef.show();
        }
    }

    toggleAccordion(selectedModel: IMultipleDCFCreateEdit, openNext: boolean, toggle: boolean): void {
        if (this.viewModels) {
            const currentModel = this.viewModels.find((vm) => vm.testId === this.currentTestId);

            if (currentModel) {
                this.validateAndSaveForm(selectedModel, currentModel, openNext, toggle);
            } else {
                const objIndex = this.viewModels.findIndex((vm) => vm.testId === selectedModel.testId);
                this.viewModels[objIndex].active = true;
                this.currentTestId = selectedModel.testId;
            }
        }
    }

    validateForm(model: IMultipleDCFCreateEdit): void {
        const updatedForm: FormGroup | undefined = this.getUpdatedForm(model.testId);
        model.errors = [];

        if (updatedForm) {
            Object.keys(updatedForm.controls).forEach((key) => {
                const control = updatedForm.get(key);
                if (control && control.errors) {
                    model.errors = model.errors ? [...model.errors, control.errors.required] : control.errors.required;
                }
            });

            model.errorsPerCategory = numberOfErrorsPerCategory(updatedForm);
        }

        if (!this.validatedTestIds.includes(model.testId)) {
            this.validatedTestIds.push(model.testId);
        }
    }

    private updateMultipleDCFs(): Array<DCF> {
        const dcfData: Array<{ dcfForm: DCFForm; dcf: DCF }> = [];
        if (this.viewModels) {
            this.viewModels.forEach((view: IMultipleDCFCreateEdit) => {
                const item: { dcfForm: DCFForm; dcf: DCF } = {
                    dcfForm: new DCFForm(),
                    dcf: new DCF(),
                };
                item.dcfForm = view.form.value as DCFForm;
                item.dcf = view.data || new DCF();
                dcfData.push(item);
            });
        }
        return dcfData.map((item: { dcfForm: DCFForm; dcf: DCF }) => mapDCFFromForm(item.dcfForm, item.dcf));
    }

    private mapDcfFormToDcfView(dcfForm: DCFForm, dcfForms: Array<DCFForm>, dcfs: Array<DCF>) {
        this.currentDcfId = dcfForm.id;
        this.isActive =
            this.isCreationMode && dcfForms && dcfForms.length === 1 && dcfForms.indexOf(dcfForm) === 0
                ? true
                : dcfForm.testId === this.currentTestId;
        const view: IMultipleDCFCreateEdit = {
            testId: dcfForm.testId,
            title: dcfForm.name,
            athleteId: dcfForm.athleteId,
            active: this.isActive,
            form: this.buildForm(dcfForm),
            data: undefined,
            dcfs,
        };

        view.data = dcfs.find((dcf: DCF) => dcf?.test?.id === view.testId || false);
        if (view.data) {
            view.status = view.data.status?.specificCode || undefined;
            this.subscriptions.add(
                this.multipleDCFsFieldsSecurity$.subscribe((fields: Map<string, FieldsSecurity> | null) => {
                    if (fields && view.data && view.data.id) {
                        view.fieldsSecurity = fields.get(view.data.id.toString());
                    }
                })
            );
        }

        if (this.validatedTestIds.includes(view.testId) || this.showErrors) {
            this.validateForm(view);
        }

        return view;
    }

    private openNextDCF(currentModel: IMultipleDCFCreateEdit) {
        if (this.viewModels) {
            const tempVm = this.viewModels.find((vm) => vm.active);
            const currentId = tempVm?.testId || '';
            const currentDCF =
                currentModel.dcfs?.find((dcf: DCF) => dcf.test && dcf.test.id === currentId) || undefined;

            this.store.dispatch(
                fromStore.MultipleDCFOpenNext({
                    dcfForm: currentModel.form.value,
                    dcf: currentDCF || null,
                })
            );
        }
    }

    private updateCurrentTest(
        selectedModel: IMultipleDCFCreateEdit,
        currentModel: IMultipleDCFCreateEdit,
        openNext: boolean,
        toggle: boolean
    ) {
        this.hasBeenOpened.add(this.currentTestId || '');

        if (this.viewModels) {
            if (openNext && !toggle) {
                const objIndex = this.viewModels.findIndex((vm) => vm.testId === this.currentTestId);
                if (selectedModel.testId !== currentModel.testId) {
                    this.currentTestId = selectedModel.testId;
                } else if (objIndex + 1 === this.viewModels.length) {
                    this.currentTestId = this.viewModels[0].testId;
                } else {
                    this.currentTestId = this.viewModels[objIndex + 1].testId;
                }
            } else if (!openNext) {
                this.currentTestId = selectedModel.testId;
            }
        }
    }

    private validateAndSaveForm(
        selectedModel: IMultipleDCFCreateEdit,
        currentModel: IMultipleDCFCreateEdit,
        openNext: boolean,
        toggle: boolean
    ) {
        this.validateForm(currentModel);
        if (hasBlockingErrors(currentModel.errorsPerCategory)) {
            return;
        }

        this.updateCurrentTest(selectedModel, currentModel, openNext, toggle);
        this.showErrors = this.isCreationMode ? this.hasBeenOpened.has(this.currentTestId || '') : true;
        this.sampleCodeValidation = false;
        this.openNextDCF(currentModel);
    }

    get isSingleForm(): boolean {
        return this.viewModels?.length === 1;
    }
}
