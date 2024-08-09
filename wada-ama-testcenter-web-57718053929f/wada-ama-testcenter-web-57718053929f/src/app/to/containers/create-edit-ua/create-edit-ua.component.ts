import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { TranslationService } from '@core/services';
import { ICreateEditUA, UA, UAForm, UAStatus } from '@to/models';
import {
    fieldNotEmpty,
    fieldRequired,
    numberOfErrorsPerCategory,
    NumberOfErrorsPerCategory,
    takeFirstError,
    validateDateFormat,
    validateMaxDate,
    validateTimeFormat,
    ValidationCategory,
    withCategory,
    zipCodeRegex,
} from '@shared/utils';
import * as fromRootStore from '@core/store';
import {
    CountryWithRegions,
    ErrorMessageKeyEnums,
    FieldsSecurity,
    ListItem,
    LocalizedEntity,
    Participant,
} from '@shared/models';
import { ConfirmLeaveComponent } from '@shared/components';
import { ConfirmLeaveService } from '@shared/services';
import * as moment from 'moment';
import { trigger } from '@angular/animations';
import { FADE_OUT } from '@core/components/animation/animation.component';
import * as fromStore from '@to/store';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-create-edit-ua',
    templateUrl: './create-edit-ua.component.html',
    styleUrls: ['./create-edit-ua.component.scss'],
    animations: [trigger('fadeOut', [FADE_OUT])],
})
export class CreateEditUAComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('cancelCreateModalRef')
    cancelCreateModalRef?: ConfirmLeaveComponent;

    @ViewChild('confirmLeaveModalRef')
    confirmLeaveModalRef?: ConfirmLeaveComponent;

    attemptMethods$: Observable<Array<LocalizedEntity> | null> = this.store.select(fromStore.getAttemptMethods);

    countries$: Observable<Array<CountryWithRegions> | null> = this.store.select(fromStore.getCountries);

    displaySaved$: Observable<boolean> = this.store.select(fromStore.getIsEveryUASaved);

    dopingControlOfficers$: Observable<Array<Participant> | null> = this.store.select(
        fromStore.getDopingControlOfficers
    );

    error$: Observable<boolean> = this.store.select(fromStore.getUAGlobalError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getUAErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    inEdit$: Observable<boolean> = this.store.select(fromStore.getIsEditMode);

    loading$: Observable<boolean> = this.store.select(fromStore.getUAGlobalLoading);

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    resultManagementAuthorities$: Observable<Array<ListItem> | null> = this.store.select(
        fromStore.getResultManagementAuthorities
    );

    saveError$ = this.store.select(fromStore.getUAError);

    translations$ = this.translationService.translations$;

    activeFromUrl = '';

    hasBeenOpened: Set<string> = new Set<string>();

    ids: Array<string> = new Array<string>();

    isEditMode = false;

    openedFromView = false;

    showErrors = false;

    viewModels: Array<ICreateEditUA> | undefined = [];

    private currentTestId: string | undefined;

    private subscriptions = new Subscription();

    private validatedTestIds: Array<string> = [];

    constructor(
        private store: Store<fromRootStore.IState>,
        private translationService: TranslationService,
        private confirmLeaveService: ConfirmLeaveService,
        private ref: ChangeDetectorRef
    ) {}

    ngAfterViewInit(): void {
        this.confirmLeaveService.confirmLeaveComponent = this.confirmLeaveModalRef;
        this.ref.detectChanges();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                const isEdit = this.isEdit(state.module);
                this.isEditMode = isEdit;
                this.ids = (state.queryParams?.id as string)?.split(',') || [];
                this.activeFromUrl = state.queryParams?.active || '';
                if (this.activeFromUrl) {
                    this.openedFromView = true;
                }
                const payload = {
                    ids: this.parseIds(state.queryParams.id),
                };
                const action = isEdit ? fromStore.InitEditUA(payload) : fromStore.InitCreateUA(payload);
                this.store.dispatch(action);
            })
        );

        this.subscriptions.add(
            combineLatest([
                this.store.pipe(select(fromStore.getUAs)),
                this.store.pipe(select(fromStore.getUAForm)),
                this.store.pipe(select(fromStore.getFieldsSecurityByUAId)),
            ]).subscribe(([uas, uaforms, securityById]: [Array<UA>, Array<UAForm>, Map<string, FieldsSecurity>]) => {
                if (uaforms && uaforms.length <= 0) {
                    return;
                }

                if (!this.currentTestId) {
                    if (this.openedFromView) {
                        this.showErrors = true;
                        const activeForm = uaforms.find((uaForm: UAForm) => uaForm.id === this.activeFromUrl);
                        if (activeForm) {
                            this.currentTestId = activeForm.testId;
                        }
                    } else {
                        this.currentTestId = uaforms[0].testId;
                    }
                }

                this.viewModels = uaforms
                    .filter(
                        (uaform) => this.ids.includes(uaform.testId) || this.ids.includes(uaform.id?.toString() || '')
                    )
                    .map((uaform: UAForm) => this.mapUAFormToUAView(uaform, uas, securityById));
                this.ref.detectChanges();
            })
        );
    }

    buildForm(uaform: UAForm): FormGroup {
        const form = new FormGroup({
            status: new FormControl(uaform.status),
            testId: new FormControl(uaform.testId),
            id: new FormControl(uaform.id),
            athleteName: new FormControl(uaform.athleteName),
            descriptionOfAttempt: new FormControl(uaform.descriptionOfAttempt, []),
            attemptDate: new FormControl(uaform.attemptDate, [
                takeFirstError(
                    withCategory(Validators.required, ValidationCategory.Mandatory),
                    withCategory(validateMaxDate(moment()), ValidationCategory.Business),
                    withCategory(validateDateFormat, ValidationCategory.Format)
                ),
            ]),
            resultManagementAuthority: new FormControl(uaform.resultManagementAuthority, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
            ]),
            whereaboutsLastCheckedDate: new FormControl(uaform.whereaboutsLastCheckedDate, [
                withCategory(validateDateFormat, ValidationCategory.Format),
            ]),
            whereaboutsLastCheckedTime: new FormControl(uaform.whereaboutsLastCheckedTime, {
                updateOn: 'blur',
                validators: [withCategory(validateTimeFormat, ValidationCategory.Format)],
            }),
            timeSlot: new FormControl(uaform.timeSlot, {
                updateOn: 'blur',
                validators: [withCategory(validateTimeFormat, ValidationCategory.Format)],
            }),
            address: new FormGroup({
                id: new FormControl(uaform.address?.id || undefined, []),
                country: new FormControl(uaform.address?.country || undefined, [
                    withCategory(Validators.required, ValidationCategory.Mandatory),
                ]),
                streetAddress1: new FormControl(uaform.address?.streetAddress1 || '', []),
                streetAddress2: new FormControl(uaform.address?.streetAddress2 || '', []),
                building: new FormControl(uaform.address?.building || '', []),
                floor: new FormControl(uaform.address?.floor || '', []),
                room: new FormControl(uaform.address?.room || '', []),
                city: new FormControl(uaform.address?.city || '', [
                    withCategory(fieldNotEmpty(), ValidationCategory.Mandatory),
                ]),
                region: new FormControl(uaform.address?.region || undefined, []),
                zipCode: new FormControl(uaform.address?.zipCode || '', [
                    withCategory(Validators.pattern(zipCodeRegex), ValidationCategory.Format),
                ]),
            }),
            location: new FormControl(uaform.location, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            specifyLocation: new FormControl(uaform.specifyLocation, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            attemptTimeFrom: new FormControl(uaform.attemptTimeFrom, {
                updateOn: 'blur',
                validators: [
                    takeFirstError(
                        withCategory(Validators.required, ValidationCategory.Mandatory),
                        withCategory(validateTimeFormat, ValidationCategory.Format)
                    ),
                ],
            }),
            attemptTimeTo: new FormControl(uaform.attemptTimeTo, {
                updateOn: 'blur',
                validators: [
                    takeFirstError(
                        withCategory(Validators.required, ValidationCategory.Mandatory),
                        withCategory(validateTimeFormat, ValidationCategory.Format)
                    ),
                ],
            }),
            attemptedContactMethods: new FormGroup({}),
            dopingControlOfficer: new FormControl(uaform.dopingControlOfficer, [
                withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
                withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
            ]),
            dateOfReport: new FormControl(uaform.dateOfReport, [
                takeFirstError(
                    withCategory(Validators.required, ValidationCategory.Mandatory),
                    withCategory(validateDateFormat, ValidationCategory.Format)
                ),
            ]),
        });
        if (uaform.attemptedContactMethods) {
            const formGroup: FormGroup | null = form.get('attemptedContactMethods') as FormGroup;
            uaform.attemptedContactMethods.forEach((value: boolean, key: string) => {
                formGroup.addControl(key, new FormControl(value));
            });
        }
        return form;
    }

    cancel(): void {
        if (this.cancelCreateModalRef) {
            this.cancelCreateModalRef.show();
        }
    }

    deleteUA(confirm: boolean, model: ICreateEditUA): void {
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

    hasBusinessOrFormatErrors(errorsPerCategory?: NumberOfErrorsPerCategory): boolean {
        if (errorsPerCategory && errorsPerCategory.Business) {
            return errorsPerCategory.Business > 0;
        }

        if (errorsPerCategory && errorsPerCategory.Format) {
            return errorsPerCategory.Format > 0;
        }

        if (errorsPerCategory && errorsPerCategory.MandatoryDraft) {
            return errorsPerCategory.MandatoryDraft > 0;
        }

        return false;
    }

    hasMandatoryErrors(errorsPerCategory?: NumberOfErrorsPerCategory): boolean {
        if (errorsPerCategory && errorsPerCategory.Mandatory) {
            return errorsPerCategory.Mandatory > 0;
        }

        if (errorsPerCategory && errorsPerCategory.MandatoryDraft) {
            return errorsPerCategory.MandatoryDraft > 0;
        }

        return false;
    }

    isEdit(module: string): boolean {
        return module.includes('edit');
    }

    mapFormToUAItem(view: ICreateEditUA): { uaForm: UAForm; ua: UA } {
        const item = { uaForm: new UAForm(), ua: new UA() };
        item.ua = view.data || new UA();
        item.uaForm = view.form.value as UAForm;

        // transform attempedContactMethods object from form into map
        const attemptedContactMethods = new Map();
        Object.entries(view.form.value.attemptedContactMethods).forEach(([key, value]) => {
            attemptedContactMethods.set(key, value as boolean);
        });
        item.uaForm.attemptedContactMethods = attemptedContactMethods;

        return item;
    }

    parseIds(param: any): Array<string> {
        return param.length <= 1 ? [param] : param;
    }

    redirectOnConfirm(redirect: boolean): void {
        if (redirect) {
            this.confirmLeaveService.confirmLeaveComponent = undefined; // prevent multiple confirmations from happening
            this.store.dispatch(fromStore.CancelUA());
        }
    }

    returnToFormAfterError(): void {
        this.store.dispatch(fromStore.ResetUAError());
    }

    saveAndReviewAll(): void {
        if (this.viewModels) {
            this.validatedTestIds = this.viewModels.map((model) => model.testId);
            const uaData: Array<{ uaForm: UAForm; ua: UA }> = [];
            let hasError = false;
            this.viewModels.forEach((view: ICreateEditUA) => {
                uaData.push(this.mapFormToUAItem(view));
                if (this.hasBusinessOrFormatErrors(view.errorsPerCategory)) {
                    hasError = true;
                }
            });
            this.showErrors = true;

            if (!hasError) {
                this.store.dispatch(fromStore.SaveAllUAs({ data: uaData }));
            }
        }
    }

    toggleAccordion(selectedModel: ICreateEditUA, openNext: boolean, toggle: boolean): void {
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

    validateForm(model: ICreateEditUA): void {
        model.errors = [];
        Object.keys(model.form.controls).forEach((key) => {
            const control = model.form.get(key);
            if (control && control.errors) {
                model.errors = model.errors ? [...model.errors, control.errors.required] : control.errors.required;
            }
        });

        model.errorsPerCategory = numberOfErrorsPerCategory(model.form);

        if (!this.validatedTestIds.includes(model.testId)) {
            this.validatedTestIds.push(model.testId);
        }
    }

    private mapUAFormToUAView(uaform: UAForm, uas: Array<UA>, securityById: Map<string, FieldsSecurity>) {
        const view: ICreateEditUA = {
            testId: uaform.testId,
            title: uaform.athleteName,
            active: uaform.testId === this.currentTestId,
            form: this.buildForm(uaform),
            data: undefined,
            uas,
        };

        view.data = uas.find((ua: UA) => {
            if (ua.test) {
                return ua.test.id === view.testId;
            }
            return false;
        });

        if (view.data) view.security = securityById.get(view.data.id);

        if (this.validatedTestIds.includes(view.testId) || this.showErrors) {
            this.validateForm(view);
            if (!this.hasBusinessOrFormatErrors(view.errorsPerCategory)) {
                view.status = this.hasMandatoryErrors(view.errorsPerCategory)
                    ? UAStatus.SavedAsDraft
                    : UAStatus.SavedAsComplete;
            }
        }

        return view;
    }

    private updateCurrentTest(
        selectedModel: ICreateEditUA,
        currentModel: ICreateEditUA,
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
        selectedModel: ICreateEditUA,
        currentModel: ICreateEditUA,
        openNext: boolean,
        toggle: boolean
    ) {
        this.validateForm(currentModel);
        this.showErrors = true;
        if (this.hasBusinessOrFormatErrors(currentModel.errorsPerCategory)) {
            return;
        }

        this.updateCurrentTest(selectedModel, currentModel, openNext, toggle);
        this.showErrors = this.hasBeenOpened.has(this.currentTestId || '');

        if (this.viewModels) {
            const tempVm = this.viewModels.find((vm) => vm.active);
            const currentId = tempVm?.testId || '';
            const currentUA = currentModel.uas?.find((ua: UA) => ua.test && ua.test.id === currentId) || undefined;

            this.store.dispatch(
                fromStore.SaveUA({
                    uaForm: currentModel.form.value,
                    ua: currentUA || null,
                })
            );
        }
    }
}
