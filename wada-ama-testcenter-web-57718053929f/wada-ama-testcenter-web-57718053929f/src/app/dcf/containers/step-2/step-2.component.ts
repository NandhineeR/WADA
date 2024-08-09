import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, map, pairwise, startWith, take, tap } from 'rxjs/operators';
import { CanComponentDeactivate } from '@dcf/guards';
import {
    controlHasModeRelatedErrors,
    numberOfErrorPerCategoryValidation,
    NumberOfErrorsPerCategory,
    numberOfErrorsPerCategory,
    scrollELementById,
    dateIsRemoved,
    ValidationCategory,
    withCategory,
    validateTimezone,
    isNullOrBlank,
    validateDatetimeFormat,
    hasValidationCategoryErrors,
    hasControlChange,
    updateTimezoneValidators,
} from '@shared/utils';
import {
    DCFFormControls,
    FieldsSecurity,
    Laboratory,
    ListItem,
    LocalizedEntity,
    MajorEvent,
    MAX_NUMBER_OF_SAMPLES,
    Participant,
    SampleType,
    SampleTypeEnum,
    StatusEnum,
    Test,
} from '@shared/models';
import * as fromRootStore from '@core/store';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { SampleInputComponent } from '@dcf/components';
import { trigger } from '@angular/animations';
import {
    Blood,
    BloodPassport,
    Sample,
    SampleInformation,
    SectionSampleAutoCompletes,
    Urine,
    DriedBloodSpot,
    AthleteInformation,
    MatchingStatus,
    Timezone,
    TimezoneField,
    UrineSampleBoundaries,
    StepsSection,
} from '@dcf/models';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromStore from '@dcf/store';
import { ANIMATE_CHILD_OUT } from '@core/components/animation/animation.component';
import { BaseSampleComponent } from '@dcf/utils/base-sample/base-sample.component';
import { isSampleReadOnly, removeUndefinedProperties } from '@dcf/utils/sample-validation.utils';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';

type Moment = moment.Moment;
type SampleInfo = SampleInformation | undefined | null;

@Component({
    selector: 'app-step-2',
    templateUrl: './step-2.component.html',
    styleUrls: ['./step-2.component.scss'],
    animations: [trigger('fadeOutChild', [ANIMATE_CHILD_OUT])],
})
export class Step2Component extends BaseSampleComponent implements CanComponentDeactivate, OnInit, AfterViewInit {
    readonly MAX_NUMBER_OF_SAMPLES = MAX_NUMBER_OF_SAMPLES;

    readonly controls = DCFFormControls;

    readonly locale = 'en';

    readonly samplesOrder = [
        SampleTypeEnum.Urine,
        SampleTypeEnum.Blood,
        SampleTypeEnum.DriedBloodSpot,
        SampleTypeEnum.BloodPassport,
    ];

    @ViewChildren(SampleInputComponent)
    sampleInputComponents?: QueryList<SampleInputComponent>;

    athlete$: Observable<AthleteInformation | null> = this.store.select(fromStore.getAthlete);

    autoCompletesAndGlobalData$: Observable<SectionSampleAutoCompletes> = combineLatest([
        this.store.pipe(select(fromAutoCompletesStore.getDCFSectionSampleAutoCompletesRefactor)),
        this.form.valueChanges.pipe(startWith({})),
    ]).pipe(
        map(([autoCompleteSectionProcedural, value]: [any, SampleInformation]) => {
            // Add newly added participant from samples to each other ex: The urine witness
            // chaperone is available in blood and bloodpassport dco autocomplete without having to save
            const autoCompleteClone = new SectionSampleAutoCompletes({ ...autoCompleteSectionProcedural });
            const participants = this.fetchParticipantFromOtherSamples(value);
            const mergedBCOArray =
                autoCompleteClone.bloodOfficials && autoCompleteClone.bloodOfficials.concat(participants);
            const mergedWitnessArray =
                autoCompleteClone.witnessChaperones && autoCompleteClone.witnessChaperones.concat(participants);
            const participantArray = mergedBCOArray && mergedBCOArray.concat(mergedWitnessArray);
            // remove duplicate participant
            const participantArrayWithoutDuplicate: Array<Participant> =
                participantArray &&
                participantArray.reduce((acc: Array<Participant>, current: Participant) => {
                    const duplicate = acc.find(
                        (participant) =>
                            participant.lastName === current.lastName && participant.firstName === current.firstName
                    );
                    if (!duplicate) {
                        return acc.concat([current]);
                    }
                    return acc;
                }, []);
            autoCompleteClone.bloodOfficials = participantArrayWithoutDuplicate || [];
            autoCompleteClone.witnessChaperones = participantArrayWithoutDuplicate || [];
            return new SectionSampleAutoCompletes(autoCompleteClone);
        })
    );

    dcfId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    filledTimezones$: Observable<Array<TimezoneField>> = this.store.pipe(select(fromStore.getTimezoneFields));

    isEditMode$: Observable<boolean> = this.store.select(fromStore.isEditMode);

    isMatchingResultType2or1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType2or1);

    isMatchingResultType3or2or1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType3or2or1);

    laboratories$: Observable<Array<Laboratory>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesLaboratories)
    );

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    manufacturers$: Observable<Array<LocalizedEntity>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesManufacturers)
    );

    samplesFormValues$: Observable<Sample[] | undefined> = this.store.pipe(
        select(fromStore.getSectionSampleFormValues),
        map((sectionSampleFormValues: SampleInformation | undefined) => sectionSampleFormValues?.samples)
    );

    readonlySample: Array<boolean> = [];

    route$: Observable<string> = this.store
        .select(fromRootStore.getActiveRouteUrl)
        .pipe(map((url) => url.split('#')[0]));

    sampleTypes$: Observable<Array<SampleType> | null> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesSampleTypes)
    );

    tempLoggerStatus$: Observable<MatchingStatus | undefined> = this.store.select(fromStore.getTempLoggerStatus);

    timezones$: Observable<Array<Timezone>> = this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesTimezones));

    urineSampleBoundaries$: Observable<UrineSampleBoundaries | null> = this.store.pipe(
        select(fromStore.getUrineSampleBoundaries)
    );

    arrivalDateValue = '';

    bloodCollectionOfficer: Participant | null = null;

    dcfRetentionPeriod: string | null = null;

    dcfStatus?: StatusEnum = undefined;

    form = new FormGroup(
        {
            arrivalDate: new FormControl(undefined, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]),
            timezone: new FormControl(null),
            testType: new FormControl(false, [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            majorEvent: new FormControl('', []),
            competitionName: new FormControl('', []),
            feeForService: new FormControl(false, [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            samples: new FormArray([]),
        },
        { updateOn: 'blur' }
    );

    inCreation = false;

    isCompetitionNameEditable = false;

    isInCompetition = false;

    isMajorEventEditable = false;

    isStepValid = true;

    isUpdatedAuthorities = false;

    majorEvents = new Array<ListItem>();

    saveError = false;

    selectedMajorEventItem: ListItem | null = null;

    showErrors = false;

    today: Moment = moment().utc(true);

    witnessChaperone: Participant | null = null;

    private hasUnmatchedLabResults = false;

    constructor(store: Store<fromRootStore.IState>) {
        super(store);
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.Step2Init());

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getSectionSampleShowErrors)).subscribe((show) => {
                this.showErrors = show;
            })
        );

        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                this.inCreation = this.isInCreation(state.url);
            })
        );

        this.subscriptions.add(
            this.store
                .pipe(select(fromStore.getSectionSampleFormValues), filter(Boolean), first())
                .subscribe((data: any) => {
                    this.form.patchValue(Step2Component.getDataForm(data), {
                        onlySelf: true,
                    });
                    if (data.samples && data.samples.length) {
                        this.clearSamples();
                        data.samples
                            .sort((sampleA: any, sampleB: any) => {
                                const indexOfSampleA = this.samplesOrder.indexOf(sampleA.sampleTypeSpecificCode);
                                const indexOfSampleB = this.samplesOrder.indexOf(sampleB.sampleTypeSpecificCode);
                                return indexOfSampleA - indexOfSampleB;
                            })
                            .forEach((sample: any) => this.addSampleToForm(sample));
                    } else {
                        /* its respective control form is fully updated in the SampleInformationInput */
                        this.addDefaultSample();
                    }
                })
        );

        this.subscriptions.add(
            this.store.select(fromRootStore.getDcfDataRetentionPeriod).subscribe((dcfRetentionPeriod) => {
                this.dcfRetentionPeriod = dcfRetentionPeriod;
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getUnmatchedLabReults).subscribe((unmatchedLabResults) => {
                this.hasUnmatchedLabResults = Boolean(unmatchedLabResults.length === 0);
            })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getSubmitCurrentStep)
                .pipe(distinctUntilChanged(), filter(Boolean))
                .subscribe(() => this.submitForm(true))
        );

        this.subscriptions.add(
            this.store.select(fromStore.getStatus).subscribe((status) => {
                this.dcfStatus = status;
            })
        );

        this.subscriptions.add(
            this.form.statusChanges
                .pipe(
                    map(() => (this.form.invalid ? numberOfErrorsPerCategory(this.form) : {})),
                    distinctUntilChanged((a: NumberOfErrorsPerCategory, b: NumberOfErrorsPerCategory) =>
                        numberOfErrorPerCategoryValidation(a, b)
                    )
                )
                .subscribe((errors) => {
                    this.store.dispatch(
                        fromStore.SubmitCurrentStepErrors({
                            section: StepsSection.SampleSection,
                            errors,
                        })
                    );
                })
        );

        this.subscriptions.add(
            this.form.valueChanges
                .pipe(startWith(undefined), pairwise())
                .subscribe(([previousSampleInformation, currentSampleInformation]: [SampleInfo, SampleInfo]) => {
                    if (currentSampleInformation && this.form.value) {
                        this.dispatchTempLogger(previousSampleInformation, this.form.value);
                    }
                })
        );

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getSourceTest)).subscribe((sourceTest: Test) => {
                this.witnessChaperone = sourceTest.witnessChaperone;
                this.bloodCollectionOfficer = sourceTest.bloodCollectionOfficer;
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getSaveError).subscribe((error: boolean | undefined) => {
                this.saveError = Boolean(error);
            })
        );

        if (!this.hasOptimisticLockException && this.samples) {
            this.dispatchTempLogger(undefined, this.form.value);
        }

        this.dcfId$.pipe(take(1)).subscribe((id: string) => {
            if (!id) {
                this.subscriptions.add(
                    this.store.pipe(select(fromStore.getTestType)).subscribe((testType: boolean) => {
                        this.testType?.setValue(testType);
                    })
                );
            }
        });

        this.subscriptions.add(
            combineLatest([
                this.store.pipe(select(fromStore.getTestingOrderId)),
                this.store.pipe(select(fromStore.isEditMode)),
            ]).subscribe(([testingOrderId, isEditMode]: [string, boolean]) => {
                this.isMajorEventEditable = isEditMode;
                this.isCompetitionNameEditable = isEditMode;
                if (!isEditMode && testingOrderId) {
                    this.store
                        .pipe(select(fromStore.getTestMajorEvent))
                        .subscribe((testMajorEvent: MajorEvent | null) => {
                            if (testMajorEvent) {
                                this.majorEvent?.setValue(testMajorEvent);
                                this.selectedMajorEventItem = this.mapMajorEventToListItem(testMajorEvent);
                            }
                        });
                    this.store
                        .pipe(select(fromStore.getTestCompetitionName))
                        .subscribe((testCompetitionName: string) => {
                            if (testCompetitionName) {
                                this.competitionName?.setValue(testCompetitionName);
                            }
                        });
                } else {
                    this.store
                        .pipe(select(fromStore.getMajorEvent), first())
                        .subscribe((majorEvent: MajorEvent | null) => {
                            this.isMajorEventEditable = true;
                            if (majorEvent) {
                                this.majorEvent?.setValue(majorEvent);
                                this.selectedMajorEventItem = this.mapMajorEventToListItem(majorEvent);
                            }
                        });
                    this.store
                        .pipe(select(fromStore.getCompetitionName), first())
                        .subscribe((competitionName: string) => {
                            this.isCompetitionNameEditable = true;
                            if (competitionName) {
                                this.competitionName?.setValue(competitionName);
                            }
                        });
                }
                this.store.pipe(select(fromStore.getMajorEvents)).subscribe((majorEvents: Array<ListItem>) => {
                    if (majorEvents && this.majorEvents.length === 0) {
                        this.majorEvents = majorEvents.map((m) => new ListItem(m)).filter(Boolean);
                    }
                    if (
                        this.selectedMajorEventItem &&
                        !this.majorEvents.some((m) => m.id === this.selectedMajorEventItem?.id)
                    ) {
                        this.majorEvents.push(this.selectedMajorEventItem);
                    }
                });
            })
        );

        if (!this.inCreation && this.arrivalDate && this.arrivalDate.value !== null) {
            this.arrivalDate.setValidators([
                withCategory(dateIsRemoved, ValidationCategory.Business),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]);
            this.arrivalDate.updateValueAndValidity();
        }
    }

    ngAfterViewInit(): void {
        this.dispatchSampleCodeValidation();

        if (this.testType) {
            this.isInCompetition = this.testType.value;
        }
    }

    addDefaultSample(): void {
        const sampleUrine = new Urine();
        sampleUrine.sampleTypeSpecificCode = SampleTypeEnum.Urine;
        sampleUrine.witnessChaperone = this.witnessChaperone;

        this.filledTimezones$.subscribe((filledTimezones) => {
            filledTimezones.forEach((filledTimezone) => {
                if (filledTimezone.dateTimeField === TimezoneField.datetimeFields.endOfProcedureDate) {
                    sampleUrine.timezone = filledTimezone.timezone;
                }
            });
        });

        this.addSampleToForm(sampleUrine);
    }

    addSample(): void {
        this.addDefaultSample();
        setTimeout(() => {
            this.submitForm(false);
        }, 500);
    }

    addSampleToForm(value: Sample): void {
        const sampleItem: Sample = SampleFactory.createSampleForForm(value);
        if (this.samples) {
            const item = SampleInputComponent.buildFormGroup(sampleItem);
            this.samples.push(item);
            this.readonlySample.push(isSampleReadOnly(sampleItem));
            const tempSample = removeUndefinedProperties(sampleItem);
            if (tempSample) {
                item.patchValue(tempSample);
            }
        }
    }

    canDeactivate(): Observable<boolean> {
        const sub = this.store.select(fromStore.getIsCurrentStepValid).subscribe((valid) => {
            this.isStepValid = valid;
        });
        if (this.isStepValid) sub.unsubscribe();
        this.submitForm(false);

        return this.store.pipe(select(fromStore.getIsCurrentStepValid)).pipe(
            take(1),
            tap((valid) => !valid && setTimeout(() => scrollELementById('notifications')))
        );
    }

    changeSample(formGroup: FormGroup): void {
        if (this.samples) {
            let index = -1;
            this.samples?.controls.forEach((e, i) => {
                if (e?.value.guid === formGroup.value.guid) {
                    index = i;
                }
            });
            if (index >= 0) {
                this.samples.removeAt(index);
                this.samples.insert(index, formGroup);
            }
        }
    }

    clearSamples(): void {
        if (this.samples) {
            while (this.samples.length !== 0) {
                this.samples.removeAt(0);
            }
        }
    }

    dcfToBeDeleted(): boolean {
        if (isNullOrBlank(this.arrivalDate?.value.toString())) {
            return false;
        }

        const currentDate = moment();
        const monthsDifference = currentDate.diff(this.arrivalDate?.value, 'months');

        return monthsDifference > Number(this.dcfRetentionPeriod) && this.hasUnmatchedLabResults;
    }

    deleteSample(deleteIndex: number): void {
        if (this.samples) {
            this.samples.removeAt(deleteIndex);
            this.dispatchSampleCodeValidation();
        }
        if (this.sampleInputComponents) {
            this.setFocusOnDeleteSample();
        }
    }

    dispatchSampleCodeValidation(): void {
        this.submitForm(false);
        this.store.dispatch(fromStore.Step2ExecuteSampleCodeValidation());
    }

    executeABPFieldsValidation(areABPFieldsInvalid: boolean): void {
        this.store.dispatch(fromStore.SetABPErrors({ hasAPBErrors: areABPFieldsInvalid }));
    }

    fetchParticipantFromOtherSamples(formValue: SampleInformation): Array<Participant> {
        let participants = new Array<Participant>();
        if (formValue && formValue.samples) {
            participants = formValue.samples
                .filter(Boolean)
                .reduce((acc: Array<Participant>, sample: Partial<Blood & Urine>) => {
                    const participant = sample.witnessChaperone || sample.bloodCollectionOfficial;
                    if (participant && participant.firstName && participant.lastName) acc.push(participant);
                    return acc;
                }, []);
        }
        return participants;
    }

    getSampleTypeLabel(index: number): string {
        return this.sampleDuplicate?.get(`sampleType${index}`)?.split('_').join(' ') || '';
    }

    /**
     * Returns a filtered list of samples given a sample type
     */
    getSamplesByType(
        samples: Array<Sample>,
        type: SampleTypeEnum
    ): Array<Blood> | Array<Urine> | Array<BloodPassport> | Array<DriedBloodSpot> {
        let filteredSamples: Array<Blood> | Array<Urine> | Array<BloodPassport> | Array<DriedBloodSpot> = [];
        if (samples) {
            if (type === SampleTypeEnum.Urine) {
                filteredSamples = samples.filter((sampleUrine) => SampleFactory.isUrine(sampleUrine)) as Array<Urine>;
            }
            if (type === SampleTypeEnum.Blood) {
                filteredSamples = samples.filter((sampleBlood) => SampleFactory.isBlood(sampleBlood)) as Array<Blood>;
            }
            if (type === SampleTypeEnum.BloodPassport) {
                filteredSamples = samples.filter((sampleBloodPassport) =>
                    SampleFactory.isBloodPassport(sampleBloodPassport)
                ) as Array<BloodPassport>;
            }
            if (type === SampleTypeEnum.DriedBloodSpot) {
                filteredSamples = samples.filter((sampleDriedBloodSpot) =>
                    SampleFactory.isDriedBloodSpot(sampleDriedBloodSpot)
                ) as Array<DriedBloodSpot>;
            }
        }

        return filteredSamples;
    }

    isInCreation(module: string): boolean {
        return module.includes('new');
    }

    isMatchResult(sample: any, type: number) {
        let isMatch = false;
        if (sample?.value?.id) {
            switch (type) {
                case 2:
                    this.store.select(fromStore.matchingResultType2or1Ids).subscribe((ids) => {
                        isMatch = Boolean(ids.find((id) => id === sample.value.id.toString()));
                    });
                    break;
                case 3:
                    this.store.select(fromStore.matchingResultType3or2or1Ids).subscribe((ids) => {
                        isMatch = Boolean(ids.find((id) => id === sample.value.id.toString()));
                    });
                    break;
                default:
                    isMatch = false;
                    break;
            }
        }
        return isMatch;
    }

    onChangeInCompetition() {
        this.isInCompetition = true;
    }

    onChangeOutCompetition() {
        this.isInCompetition = false;
        if (this.isMajorEventEditable) this.selectedMajorEvent(null);
    }

    selectedMajorEvent(majorEventListItem: ListItem | null): void {
        if (
            majorEventListItem &&
            majorEventListItem.id &&
            Number(majorEventListItem.id).toString() !== this.selectedMajorEventItem?.id?.toString()
        ) {
            this.majorEvent?.setValue(majorEventListItem);
            this.selectedMajorEventItem = majorEventListItem;
            this.isUpdatedAuthorities = true;
            this.store.dispatch(
                fromStore.Step2GetMajorEvent({
                    majorEventId: majorEventListItem.id.toString(),
                })
            );
        }
        if (majorEventListItem == null && this.selectedMajorEventItem !== majorEventListItem) {
            this.majorEvent?.setValue(null);
            this.selectedMajorEventItem = null;
            this.isUpdatedAuthorities = false;
            this.store.dispatch(fromStore.Step2ResetMajorEvent());
            this.store.dispatch(fromStore.Step2ResetDefaultAuthority());
        }
    }

    private dispatchTempLogger(
        previousSampleInformation: SampleInformation | null | undefined,
        currentSampleInformation: SampleInformation
    ): void {
        const currentBloodPassports: Array<BloodPassport> | undefined = currentSampleInformation.samples
            ? currentSampleInformation.samples
                  .filter((sampleBloodPassport) => SampleFactory.isBloodPassport(sampleBloodPassport))
                  .map((sampleBloodPassport) => sampleBloodPassport as BloodPassport)
            : undefined;
        const oldBloodPassports: Array<BloodPassport> | undefined = previousSampleInformation?.samples
            ? previousSampleInformation.samples
                  .filter((sampleBloodPassport) => SampleFactory.isBloodPassport(sampleBloodPassport))
                  .map((sampleBloodPassport) => sampleBloodPassport as BloodPassport)
            : undefined;

        if (!currentBloodPassports || !oldBloodPassports) return;

        if (oldBloodPassports.length < currentBloodPassports.length) {
            currentBloodPassports.pop();
        }

        currentBloodPassports.forEach((currentBloodPassport, index) => {
            const oldBloodPassport = oldBloodPassports[index];

            const isDifferent =
                !(
                    previousSampleInformation &&
                    previousSampleInformation.arrivalDate &&
                    currentSampleInformation.arrivalDate &&
                    previousSampleInformation.arrivalDate.toISOString() ===
                        currentSampleInformation.arrivalDate.toISOString()
                ) ||
                !(
                    oldBloodPassport &&
                    currentBloodPassport &&
                    oldBloodPassport.tempLoggerId === currentBloodPassport.tempLoggerId
                );

            if (currentSampleInformation.arrivalDate && currentBloodPassport?.tempLoggerId && isDifferent) {
                this.store.dispatch(
                    fromStore.Step2GetTempLoggerStatus({
                        tempLoggerId: currentBloodPassport.tempLoggerId,
                        date: currentSampleInformation.arrivalDate,
                    })
                );
            } else if (
                previousSampleInformation?.arrivalDate !== currentSampleInformation.arrivalDate &&
                !currentSampleInformation.arrivalDate
            ) {
                this.store.dispatch(fromStore.Step2ResetTempLoggerStatus());
            }
        });
    }

    private static getDataForm(data: any): any {
        const dataForm: any = {};
        Object.keys(data).forEach((propertyName: string) => {
            if (propertyName !== 'samples') {
                dataForm[propertyName] = data[propertyName];
            }
        });
        return dataForm;
    }

    private isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    private mapMajorEventToListItem(majorEvent: MajorEvent): ListItem | null {
        if (!majorEvent) return null;

        const listItem = new ListItem();
        listItem.id = Number(majorEvent.id);
        listItem.description = majorEvent.description;
        listItem.name = majorEvent.shortDescription;
        return listItem;
    }

    private setFocusOnDeleteSample(): void {
        if (this.sampleInputComponents && this.sampleInputComponents.last) {
            setTimeout(() => this.sampleInputComponents && this.sampleInputComponents.last.setFocusOnDelete());
        }
    }

    private submitForm(saving: boolean): void {
        let updatedSampleComponents = [];
        let updatedSamples: Sample[] = [];
        if (this.sampleInputComponents && this.samples) {
            const sampleComponents = this.sampleInputComponents.map(
                (sampleInput: SampleInputComponent) => sampleInput.actualForm.value
            );

            if (sampleComponents.length > 0) {
                // remove deleted samples
                updatedSampleComponents = sampleComponents.filter(
                    (x) => (this.samples?.value as Sample[]).find((y) => y.guid === x.guid) !== undefined
                );

                // update form with latest form groups from sample components
                this.samples?.patchValue(updatedSampleComponents);

                updatedSamples = updatedSampleComponents.map((sampleItem: Sample) =>
                    SampleFactory.createSampleFromForm(sampleItem)
                );
            } else {
                updatedSamples = this.samples?.value;
            }

            if (updatedSamples?.length > 0) {
                const values = {
                    ...this.form.value,
                    samples: updatedSamples,
                };
                if (saving) {
                    this.store.dispatch(fromStore.Step2SubmitForm({ values }));
                } else {
                    this.store.dispatch(fromStore.Step2SectionSampleSubmitForm({ values }));
                }
            }
        }
    }

    private updateTimezoneValidators(): void {
        if (
            hasControlChange(this.arrivalDateValue, this.arrivalDate) &&
            !isNullOrBlank(this.arrivalDate?.value?.toString())
        ) {
            this.arrivalDateValue = this.arrivalDate?.value?.toString() || '';
            updateTimezoneValidators(
                this.timezone,
                validateTimezone(this.arrivalDate?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (this.timezone?.validator && isNullOrBlank(this.arrivalDate?.value?.toString())) {
            this.arrivalDateValue = '';
            const validator = this.timezone.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateTimezoneValidators(this.timezone, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    get arrivalDate(): AbstractControl | null {
        return this.form.get('arrivalDate');
    }

    get arrivalDateHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.arrivalDate,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.arrivalDate?.errors?.required
        );
    }

    get competitionName(): AbstractControl | null {
        return this.form.get('competitionName');
    }

    get feeForService(): AbstractControl | null {
        return this.form.get('feeForService');
    }

    get feeForServiceHasErrors(): boolean {
        return controlHasModeRelatedErrors(this.feeForService, this.showErrors || this.isDCFCompleted(), false, false);
    }

    get formHasWarnings(): boolean {
        return this.sampleHasWarnings;
    }

    get majorEvent(): AbstractControl | null {
        return this.form.get('majorEvent');
    }

    get samples(): FormArray | null {
        return this.form.get('samples') as FormArray;
    }

    get sampleHasWarnings(): boolean {
        let hasWarning = false;
        if (this.samples) {
            this.samples.controls.forEach((control: AbstractControl) => {
                const keys: Array<string> = Object.keys((control as FormGroup).controls);
                keys.forEach((key: string) => {
                    const controlItem = (control as FormGroup).controls[key];
                    hasWarning =
                        (controlItem &&
                            controlItem.invalid &&
                            hasValidationCategoryErrors(controlItem, ValidationCategory.Warning)) ||
                        hasWarning;
                });
            });
        }

        return hasWarning;
    }

    get testType(): AbstractControl | null {
        return this.form.get('testType');
    }

    get testTypeHasErrors(): boolean {
        return controlHasModeRelatedErrors(this.testType, this.showErrors || this.isDCFCompleted(), false, false);
    }

    get timezone(): AbstractControl | null {
        return this.form.get('timezone');
    }

    get timezoneHasErrors() {
        this.updateTimezoneValidators();
        return controlHasModeRelatedErrors(
            this.timezone,
            (this.showErrors && this.isDCFCompleted()) || this.timezone?.errors?.validateEmptyTimezone?.error?.invalid,
            this.inCreation,
            this.timezone?.errors?.validateEmptyTimezone?.error?.invalid
        );
    }
}
