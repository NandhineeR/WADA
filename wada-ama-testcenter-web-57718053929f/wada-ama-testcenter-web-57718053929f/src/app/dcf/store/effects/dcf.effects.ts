import {
    LabResult,
    DCF,
    DCFMode,
    Sample,
    UrineSampleBoundaries,
    StepsSection,
    MatchingStatus,
    TimeSlot,
    AthleteInformation,
} from '@dcf/models';
import { Injectable } from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, NEVER, Observable, of } from 'rxjs';
import {
    catchError,
    concatMap,
    filter,
    first,
    map,
    mergeMap,
    pairwise,
    startWith,
    switchMap,
    switchMapTo,
    take,
    withLatestFrom,
} from 'rxjs/operators';
import { DCFService } from '@dcf/services';
import { AthleteService } from '@athlete/services';
import * as fromRootStore from '@core/store';
import * as RouterActions from '@core/store/actions/router.actions';
import { ConflictException } from '@core/models';
import * as moment from 'moment';
import { DCF_MODULE_NAME, isNotNull, isNullOrBlank, propsUndefined, removeLastSlash } from '@shared/utils';
import {
    Attachment,
    GenericActivity,
    GenericActivityTypeEnum,
    ListItem,
    MajorEvent,
    SampleType,
    SecurityWrapper,
    TOItem,
    Test,
    UserRolesEnum,
} from '@shared/models';
import { Exception } from '@core/models/exception';
import { environment } from '@env';
import * as AutoCompletesActions from '@autocompletes/store/actions';
import * as AutoCompletesSelectors from '@autocompletes/store/selectors';
import * as DCFActions from '@dcf/store/actions';
import * as DCFSelectors from '@dcf/store/selectors/dcf.selectors';
import * as SampleManagementActions from '@sampleManagement/store/actions';
import * as UserInfoSelectors from '@core/store/selectors/user-info.selectors';
import { GenericActivityApiService, MajorEventApiService } from '@shared/services';

@Injectable()
export class DCFEffects {
    backToViewDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.BackToViewDCF),
            switchMap(() => [DCFActions.ResetDCF()])
        )
    );

    backToViewTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.BackToViewTestingOrder),
            withLatestFrom(this.store.pipe(select(DCFSelectors.getTOId))),
            filter(([, toId]) => !isNullOrBlank(toId)),
            switchMap(([, toId]) => [DCFActions.GoToViewTestingOrder({ id: toId })])
        )
    );

    bindDCFToTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.BindDCFToTestingOrder),
            switchMap((action) => this.dcfService.bindDCFToTestingOrder(action.bindDCFToTO)),
            switchMap((wrapper: SecurityWrapper<DCF>) => {
                const actions: Action[] = [
                    DCFActions.BindDCFToTestingOrderSuccess({ dcf: wrapper.data }),
                    DCFActions.SetSecurity({
                        fields: wrapper.fields,
                        actions: wrapper.actions,
                    }),
                    SampleManagementActions.NotifyTestingOrder(),
                ];
                if (wrapper.data && wrapper.data.test && wrapper.data.test.id) {
                    actions.push(
                        DCFActions.GetGenericActivities({
                            testId: wrapper.data.test.id,
                        })
                    );
                }
                return actions;
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(DCFActions.BindDCFToTestingOrderError()))
            )
        )
    );

    breakSampleMatch$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.BreakSampleMatch),
            switchMap((action) =>
                this.dcfService.deleteMatchingResult(action.dcfId, action.sampleId, action.reason, action.sampleJarCode)
            ),
            map(() => DCFActions.BreakSampleMatchSuccess()),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.BreakSampleMatchError()));
            })
        )
    );

    cancelDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.CancelDCF),
            withLatestFrom(this.store.pipe(select(DCFSelectors.getTestingOrderNumber))),
            switchMap(([action, testingOrderNumber]) => {
                switch (action.mode) {
                    case DCFMode.CreateFromTO:
                        if (testingOrderNumber) {
                            return [DCFActions.BackToViewTestingOrder()];
                        }
                        this.navigateToClassic('MissionOrder', testingOrderNumber);
                        return [];
                    case DCFMode.CreateFromMultipleDCF:
                        return [DCFActions.MultipleDCFBackToViewTestingOrder()];
                    case DCFMode.CreateFromAthlete:
                        return this.store.pipe(
                            select(DCFSelectors.getAthleteId),
                            switchMap((athleteId: string | null) => {
                                if (athleteId && !isNullOrBlank(athleteId)) {
                                    this.navigateToClassic('Athlete', athleteId);
                                }

                                return [];
                            })
                        );
                    case DCFMode.Edit:
                        return [DCFActions.BackToViewDCF()];
                    default:
                        return [];
                }
            })
        )
    );

    changeDCFStatusCancel$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.ChangeDCFStatusCancel),
            withLatestFrom(this.store.pipe(select(DCFSelectors.getDCFId))),
            switchMap(([action, dcfId]: [any, number | null]) =>
                this.dcfService.changeDCFStatusCancel(dcfId?.toString() || '', action.reason)
            ),
            map(() => DCFActions.SaveCancelDCFSuccess()),
            catchError((error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.SaveCancelDCFError({ error })));
            })
        )
    );

    changeSampleCode$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.ChangeSampleCode),
            switchMap((action) =>
                this.dcfService.correctSampleCode(action.dcfId, action.sampleId, action.reason, action.sampleCode)
            ),
            map(() => DCFActions.ChangeSampleCodeSuccess()),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.ChangeSampleCodeError()));
            })
        )
    );

    changeSampleTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.ChangeSampleType),
            switchMap((action) =>
                this.dcfService.correctSampleType(action.dcfId, action.sampleId, action.reason, action.sampleType)
            ),
            map(() => DCFActions.ChangeSampleTypeSuccess()),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.ChangeSampleTypeError()));
            })
        )
    );

    changeSampleValidity$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.ChangeSampleValidity),
            switchMap((action) => this.dcfService.updateSampleValidity(action.dcfId, action.sampleValidityUpdate)),
            switchMap(() => [DCFActions.ChangeSampleValiditySuccess(), DCFActions.ReloadDCF()]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.ChangeSampleValidityError(), DCFActions.ReloadDCF()));
            })
        )
    );

    createDCFFromAthlete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.CreateDCFFromAthlete),
            map((action) =>
                DCFActions.GetAthleteSuccess({
                    athlete: action.athlete,
                    countriesWithRegions: action.countriesWithRegions,
                    mode: DCFMode.CreateFromAthlete,
                })
            )
        )
    );

    createToEdit$: Observable<boolean> = this.store.select(fromRootStore.getActiveRouteUrl).pipe(
        pairwise(),
        map(([prev, next]) => prev.startsWith('/dcf/new') && next.startsWith('/dcf/edit'))
    );

    deleteDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.DeleteDCF),
            switchMap((action) => this.dcfService.deleteDCF(action.dcfId, action.reason)),
            switchMap(() => [DCFActions.DeleteDCFSuccess(), DCFActions.GoToTestingOrderManagement()]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.DeleteDCFError()));
            })
        )
    );

    executeSampleCodeValidation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step2ExecuteSampleCodeValidation),
            mergeMap(() => this.store.pipe(select(DCFSelectors.getCurrentDCF), first())),
            switchMap((dcf: DCF) => this.dcfService.executeSampleCodeValidation(dcf)),
            map((samples) =>
                DCFActions.Step2ExecuteSampleCodeValidationSuccess({
                    samples: samples as Array<Sample>,
                })
            ),
            catchError((error: any, effect: Observable<Action>) => {
                if (error.status === 409) {
                    const exception: ConflictException = new ConflictException(error.error);
                    return effect.pipe(startWith(DCFActions.Step2ExecuteSampleCodeValidationError({ exception })));
                }
                return effect;
            })
        )
    );

    getAthlete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetAthlete),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions))),
            switchMap(([action, countriesWithRegions]: [any, any]) =>
                this.athleteService.getAthlete(action.id).pipe(
                    map((athlete: AthleteInformation) => {
                        if (action.mode === DCFMode.Edit || action.mode === DCFMode.CreateFromTO) {
                            return DCFActions.GetAthleteSuccess({
                                athlete,
                                countriesWithRegions,
                                mode: action.mode,
                            });
                        }
                        return DCFActions.CreateDCFFromAthlete({
                            athlete,
                            countriesWithRegions,
                        });
                    })
                )
            ),
            catchError((_error, effect: Observable<Action>) => effect.pipe(startWith(DCFActions.GetAthleteError())))
        )
    );

    getAttachments = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetAttachments),
            switchMap((action) => this.dcfService.getAttachments(action.dcfId, action.types)),
            map((attachments: Array<Attachment>) => DCFActions.GetAttachmentsSuccess({ attachments }))
        )
    );

    getAttachmentsAthletePhoto$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetAttachmentsAthletePhoto),
            switchMap((action) => this.dcfService.getAttachmentUrl(action.dcfId, action.fileKey)),
            map((attachment: Attachment) => DCFActions.GetAttachmentsAthletePhotoSuccess({ url: attachment.url }))
        )
    );

    getAttachmentsChainOfCustody$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetAttachmentsChainOfCustody),
            switchMap((action) => this.dcfService.getAttachmentUrl(action.dcfId, action.fileKey)),
            map((attachment: Attachment) => DCFActions.GetAttachmentsChainOfCustodySuccess({ url: attachment.url }))
        )
    );

    getAttachmentsNotification$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetAttachmentsNotification),
            switchMap((action) => {
                return this.dcfService.getAttachmentUrl(action.dcfId, action.fileKey);
            }),
            map((attachment: Attachment) =>
                DCFActions.GetAttachmentsNotificationSuccess({
                    url: attachment.url,
                })
            )
        )
    );

    getAttachmentsSignedCopy$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetAttachmentsSignedCopy),
            switchMap((action) => this.dcfService.getAttachmentUrl(action.dcfId, action.fileKey)),
            map((attachment: Attachment) => DCFActions.GetAttachmentsSignedCopySuccess({ url: attachment.url }))
        )
    );

    getDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetDCF),
            switchMap((action) => this.dcfService.getDCF(action.dcfId)),
            switchMap((wrapper: SecurityWrapper<DCF>) => [
                DCFActions.GetDCFSuccess({ dcf: wrapper.data }),
                DCFActions.SetSecurity({
                    fields: wrapper.fields,
                    actions: wrapper.actions,
                }),
            ]),
            catchError((error: any, effect: Observable<Action>) => {
                const exception = this.handleDCFError(error.error);
                return effect.pipe(startWith(DCFActions.GetDCFError({ error: exception })));
            })
        )
    );

    getDCFSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetDCFSuccess),
            switchMap(() => this.store.pipe(select(DCFSelectors.getIsUserAnonymous))),
            switchMap((isUserAnonymous: boolean) => {
                return this.store.pipe(
                    select(DCFSelectors.getTest),
                    filter((test: Test | null) => test !== null && !propsUndefined(test) && test.athlete?.id !== null),
                    first(),
                    switchMap((test: Test | null) => {
                        if (!isUserAnonymous) {
                            this.store.dispatch(
                                DCFActions.GetAthlete({
                                    id: test?.athlete?.id?.toString() || '',
                                    mode: DCFMode.Edit,
                                })
                            );
                        }
                        return [
                            DCFActions.GetGenericActivities({
                                testId: test?.id || '',
                            }),
                        ];
                    })
                );
            })
        )
    );

    getGenericActivities$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetGenericActivities),
            switchMap((action) =>
                this.genericActivityService.getGenericActivities(
                    GenericActivityTypeEnum.DCF.toString(),
                    GenericActivityTypeEnum.TEST.toString(),
                    action.testId
                )
            ),
            map((genericActivities: Array<GenericActivity>) =>
                DCFActions.GetGenericActivitiesSuccess({ genericActivities })
            ),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.GetGenericActivitiesError()));
            })
        )
    );

    getLabResult$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetLabResult),
            switchMap((action) => this.dcfService.getLabResult(action.labResultId, action.isBloodPassport)),
            map((labResult: LabResult) => DCFActions.GetLabResultSuccess({ labResult })),
            catchError((_error, effect: Observable<Action>) => effect.pipe(startWith(DCFActions.GetLabResultError())))
        )
    );

    getMajorEvent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step2GetMajorEvent),
            switchMap((action) => this.majorEventService.getMajorEvent(action.majorEventId)),
            switchMap((majorEvent: MajorEvent) => [
                DCFActions.Step2GetMajorEventSuccess({ majorEvent }),
                DCFActions.Step2UpdateAuthority({
                    testAuthority: majorEvent.testAuthority,
                    sampleCollectionAuthority: majorEvent.sampleCollectionAuthority,
                    resultManagementAuthority: majorEvent.resultManagementAuthority,
                }),
            ]),
            catchError((error, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.Step2GetMajorEventError(error)));
            })
        )
    );

    getMajorEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step2GetMajorEvents),
            switchMap((action) => this.majorEventService.getMajorEvents(action.numberPriorMonths)),
            map((majorEvents: Array<ListItem>) => DCFActions.Step2GetMajorEventsSuccess({ majorEvents }))
        )
    );

    getStep1AutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step1GetAutoCompletes),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getDCFSectionAthleteAutoCompletes)),
                this.store.pipe(select(AutoCompletesSelectors.getDCFSectionAuthorizationAutoCompletes)),
                this.store.pipe(select(AutoCompletesSelectors.getDCFSectionNotificationAutoCompletes))
            ),
            switchMap(([action, sectionAthlete, sectionAuthorization, sectionNotification]: [any, any, any, any]) => {
                switch (action.section) {
                    case StepsSection.AthleteSection:
                        if (!sectionAthlete?.coaches?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFCoaches());
                        }
                        if (!sectionAthlete?.doctors?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFDoctors());
                        }
                        if (!sectionAthlete?.sportDisciplines?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFSportDisciplines());
                        }
                        return [];
                    case StepsSection.AuthorizationSection:
                        if (!sectionAuthorization?.ados?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFAdos());
                        }
                        if (!sectionAuthorization?.dtps?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFDtps());
                        }
                        return [];
                    case StepsSection.NotificationSection:
                        if (!sectionNotification?.identificationDocuments?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFIdentificationDocuments());
                        }
                        if (!sectionNotification?.selectionCriteria?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFSelectionCriteria());
                        }
                        if (!sectionNotification?.notifyingChaperones?.length) {
                            this.store.dispatch(AutoCompletesActions.GetDCFNotifyingChaperones());
                        }
                        return [];
                    default:
                        throw new Error();
                }
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(DCFActions.Step1GetAutoCompletesError()))
            )
        )
    );

    getStep2AutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step2GetAutoCompletes),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getDCFSectionSampleAutoCompletes))),
            switchMap(([, sectionSample]: [Action, any]) => {
                if (!sectionSample?.bloodOfficials?.length) {
                    this.store.dispatch(AutoCompletesActions.GetDCFBloodOfficials());
                }
                if (!sectionSample?.manufacturers?.length) {
                    this.store.dispatch(AutoCompletesActions.GetDCFManufacturers());
                }
                if (!sectionSample?.witnessChaperones?.length) {
                    this.store.dispatch(AutoCompletesActions.GetDCFWitnessChaperones());
                }
                return [];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(DCFActions.Step2GetAutoCompletesError()))
            )
        )
    );

    getStep3AutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step3GetAutoCompletes),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getDCFSectionProceduralAutoCompletes))),
            switchMap(([, sectionProcedural]: [Action, any]) => {
                this.store.dispatch(AutoCompletesActions.GetDCFDcos());
                if (!sectionProcedural?.athleteRepresentatives?.length) {
                    this.store.dispatch(AutoCompletesActions.GetDCFAthleteRepresentatives());
                }
                if (!sectionProcedural?.nonConformityCategories?.length) {
                    this.store.dispatch(AutoCompletesActions.GetDCFNonConformityCategories());
                }
                return [];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(DCFActions.Step3GetAutoCompletesError()))
            )
        )
    );

    getTempLoggerStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step2GetTempLoggerStatus),
            switchMap<any, Observable<MatchingStatus>>((action) =>
                this.dcfService.getTempLoggerStatus(action.tempLoggerId, action.date)
            ),
            map((tempLoggerStatus: MatchingStatus) => DCFActions.Step2GetTempLoggerStatusSuccess({ tempLoggerStatus }))
        )
    );

    getTest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetTest),
            switchMap((action) => this.dcfService.getTest(action.id)),
            map((test: Test) => DCFActions.GetTestSuccess({ test })),
            catchError(() => of(DCFActions.GetTestError()))
        )
    );

    getTestingOrders$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetTestingOrders),
            switchMap((action) => this.athleteService.getTestingOrders(action.athleteId)),
            map((testingOrders: Array<TOItem>) => DCFActions.GetTestingOrdersSuccess({ testingOrders })),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(DCFActions.GetTestingOrdersError()));
            })
        )
    );

    getTimeSlots$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step1GetTimeSlots),
            switchMap((action) =>
                combineLatest([
                    of(action.date),
                    this.store.pipe(select(DCFSelectors.getAthleteId), first()),
                    this.store.pipe(select(DCFSelectors.getAthleteAccessible)),
                ])
            ),
            filter(
                ([date, id, accessible]: [any, string | null, boolean | null]) =>
                    !isNullOrBlank(id) && accessible !== null && Boolean(accessible && moment(date).isValid())
            ),
            switchMap(([date, id]: [any, any, boolean | null]) => this.dcfService.getTimeslots(id, date)),
            map((timeSlots: Array<TimeSlot>) => DCFActions.Step1GetTimeslotsSuccess({ timeSlots })),
            catchError(() => of(DCFActions.Step1GetTimeslotsError()))
        )
    );

    getUrineSampleBoundaries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GetUrineSampleBoundaries),
            withLatestFrom(this.store.pipe(select(DCFSelectors.getUrineSampleBoundaries))),
            filter(([, urineSampleBoundaries]: [Action, any]) => propsUndefined(urineSampleBoundaries)),
            switchMap(() => this.dcfService.getUrineBoundaries()),
            map((urineSampleBoundaries: UrineSampleBoundaries) => {
                return DCFActions.GetUrineSampleBoundariesSuccess({ urineSampleBoundaries });
            })
        )
    );

    goToEditDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GoToEditDCF),
            map((action) =>
                RouterActions.Go({
                    path: ['dcf', 'edit', action.id, 'step', action.step],
                })
            )
        )
    );

    goToTestingOrderManagement$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GoToTestingOrderManagement),
            map(() => {
                return RouterActions.Go({ path: ['tos'] });
            })
        )
    );

    goToViewDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GoToViewDCF),
            map((action) => RouterActions.Go({ path: ['dcf', 'view', action.id] }))
        )
    );

    goToViewDashboard$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GoToViewDashboard),
            map(() => RouterActions.Go({ path: ['dashboard'] }))
        )
    );

    goToViewTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.GoToViewTestingOrder),
            map((action) => RouterActions.Go({ path: ['to', 'view', action.id] }))
        )
    );

    initCreateDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.InitCreateDCF),
            switchMap(() => this.store.pipe(select(fromRootStore.getActiveRouteQueryParams), first())),
            switchMap(
                ({ from, testId, athleteId }): Observable<Action> => {
                    if (from === 'to') {
                        this.store.dispatch(DCFActions.GetTest({ id: testId, fromTo: true }));
                        return combineLatest([
                            this.store.pipe(select(DCFSelectors.getSourceTest)),
                            this.store.pipe(select(DCFSelectors.getSourceTestAthleteId)),
                        ]).pipe(
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            filter(([test, id]: [Test, any]) => DCFEffects.canGetAthlete(test, id, testId)),
                            first(),
                            switchMap(([, id]: [Test, number]) => [
                                DCFActions.GetAthlete({
                                    id: id.toString(),
                                    mode: DCFMode.CreateFromTO,
                                }),
                            ])
                        );
                    }
                    return of(
                        DCFActions.GetAthlete({
                            id: athleteId,
                            mode: DCFMode.CreateFromAthlete,
                        })
                    );
                }
            )
        )
    );

    initEditDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.InitEditDCF),
            withLatestFrom(this.createToEdit$),
            switchMap(([action, isFromCreate]: [any, boolean]) => {
                this.store.dispatch(DCFActions.Step2GetMajorEvents({ numberPriorMonths: '0' }));
                return !isFromCreate ? [DCFActions.GetDCF({ dcfId: action.dcfId })] : [];
            })
        )
    );

    initStep1$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step1Init),
            switchMap((action) => [DCFActions.Step1GetAutoCompletes({ section: action.section })])
        )
    );

    initStep2$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step2Init),
            withLatestFrom(this.store.pipe(select(DCFSelectors.getTestingOrderNumber))),
            switchMap(([, testingOrderId]: [Action, string]) => {
                if (!testingOrderId) {
                    this.store.dispatch(DCFActions.Step2GetMajorEvents({ numberPriorMonths: '0' }));
                }
                return [DCFActions.Step2GetAutoCompletes(), DCFActions.GetUrineSampleBoundaries()];
            })
        )
    );

    initStep3$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step3Init),
            switchMap(() => [DCFActions.Step3GetAutoCompletes()])
        )
    );

    initViewDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.InitViewDCF),
            switchMap(() => this.store.pipe(select(DCFSelectors.getResetDCF))),
            switchMap((resetDCF: boolean | null) => {
                if (resetDCF) {
                    return [DCFActions.InitViewFromReset()];
                }

                return [DCFActions.SetIsUserAnonymous(), DCFActions.GetUrineSampleBoundaries()];
            })
        )
    );

    initViewMatchingResults$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.InitViewMatchingResults),
            withLatestFrom(this.store.pipe(select(DCFSelectors.getDCFId))),
            filter(([action, dcfId]) => action.dcfId !== dcfId),
            switchMap(([action]) => {
                return of(DCFActions.GetDCF({ dcfId: action.dcfId }));
            })
        )
    );

    navigateToDCFView$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RouterActions.RouterActive),
            withLatestFrom(this.store.pipe(select(DCFSelectors.getResetDCF))),
            switchMap(([action, resetDCF]: [any, boolean | null]) => {
                return action.routerState.module === DCF_MODULE_NAME &&
                    resetDCF === false &&
                    action.routerState.url.includes('view') &&
                    !action.routerState.url.includes('multiple')
                    ? of(
                          DCFActions.GetDCF({
                              dcfId: +action.routerState.params.id,
                          })
                      )
                    : NEVER;
            })
        )
    );

    preloadAutoCompletesCreateOrEdit$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.PreloadAutoCompletesCreateOrEdit),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesLaboratories), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesTimezones), take(1)),
                ])
            ),
            switchMap(([countriesWithRegions, laboratories, sampleTypes, timezones]: [any, any, any, any]) => {
                if (countriesWithRegions.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetDCFCountriesWithRegions());
                }
                if (laboratories.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetDCFLaboratories());
                }
                if (sampleTypes.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetDCFSampleTypes());
                }
                if (timezones.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetDCFTimezones());
                }
                return [DCFActions.PreloadAutoCompletesCreateOrEditSuccess()];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(DCFActions.PreloadAutoCompletesCreateOrEditError()))
            )
        )
    );

    preloadAutoCompletesView$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.PreloadAutoCompletesView),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesLaboratories), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesManufacturers), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesNonConformityCategories), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesTimezones), take(1)),
                ])
            ),
            switchMap(
                ([countriesWithRegions, laboratories, manufacturers, nonConformityCategories, sampleTypes, timezones]: [
                    any,
                    any,
                    any,
                    any,
                    any,
                    any
                ]) => {
                    if (countriesWithRegions.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFCountriesWithRegions());
                    }
                    if (laboratories.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFLaboratories());
                    }
                    if (manufacturers.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFManufacturers());
                    }
                    if (nonConformityCategories.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFNonConformityCategories());
                    }
                    if (sampleTypes.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFSampleTypes());
                    }
                    if (timezones.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFTimezones());
                    }
                    return [DCFActions.PreloadAutoCompletesViewSuccess()];
                }
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(DCFActions.PreloadAutoCompletesViewError()))
            )
        )
    );

    reloadDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.ReloadDCF),
            switchMapTo(this.store.pipe(select(DCFSelectors.getDCFId))),
            filter(isNotNull),
            map((dcfId: number) => DCFActions.GetDCF({ dcfId }))
        )
    );

    resetDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.ResetDCF),
            switchMapTo(this.store.pipe(select(DCFSelectors.getDCFId))),
            filter(isNotNull),
            switchMap((dcfId: number) => [DCFActions.GoToViewDCF({ id: dcfId })])
        )
    );

    saveDCF$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.SaveDCF),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(select(DCFSelectors.getCurrentDCF), first()),
                    this.store.pipe(select(DCFSelectors.getOriginalDCF), first()),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes), first()),
                ])
            ),
            switchMap(([currentDCF, originalDCF, sampleTypes]: [DCF, DCF, Array<SampleType>]) =>
                currentDCF.id
                    ? this.dcfService.updateDCF(originalDCF, currentDCF, sampleTypes)
                    : this.dcfService.createDCF(currentDCF, sampleTypes)
            ),
            switchMap((wrapper: SecurityWrapper<DCF>) => [
                DCFActions.SaveDCFSuccess({ dcf: wrapper.data }),
                DCFActions.SetSecurity({
                    fields: wrapper.fields,
                    actions: wrapper.actions,
                }),
                DCFActions.GoToViewDCF({
                    id: wrapper.data.id || 0,
                }),
                SampleManagementActions.NotifyTest(),
            ]),
            catchError((error: any, effect: Observable<Action>) => {
                const exception = this.handleDCFError(error.error);
                return effect.pipe(startWith(DCFActions.SaveDCFError({ error: exception })));
            })
        )
    );

    saveDCFCancelSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.SaveCancelDCFSuccess),
            switchMapTo(this.store.pipe(select(DCFSelectors.getDCFId))),
            filter(isNotNull),
            map((dcfId: number) => DCFActions.GetDCF({ dcfId }))
        )
    );

    setIsUserAnonymous$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.SetIsUserAnonymous),
            take(1),
            switchMap(() => this.store.pipe(select(UserInfoSelectors.getRoles))),
            switchMap((roles: string[]) => {
                const canReadAthleteInformation =
                    roles.includes(UserRolesEnum.ATH_DEMOGRAPHIC_WRITER) ||
                    roles.includes(UserRolesEnum.ATH_DEMOGRAPHIC_READER) ||
                    roles.includes(UserRolesEnum.DCO_RIGHT);

                return [DCFActions.SetIsUserAnonymousSuccess({ isUserAnonymous: !canReadAthleteInformation })];
            })
        )
    );

    stepSubmitForm$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.Step1SubmitForm, DCFActions.Step2SubmitForm, DCFActions.Step3SubmitForm),
            switchMap(() => [DCFActions.SubmitCurrentStepSuccess(), DCFActions.SaveDCF()])
        )
    );

    sectionSubmitForm$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                DCFActions.Step1SectionAthleteSubmitForm,
                DCFActions.Step1SectionAuthorizationSubmitForm,
                DCFActions.Step1SectionNotificationSubmitForm,
                DCFActions.Step2SectionSampleSubmitForm,
                DCFActions.Step3SectionProceduralSubmitForm
            ),
            switchMap(() => [DCFActions.SubmitCurrentStepSuccess()])
        )
    );

    updateMatchingResultStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.UpdateMatchingResultStatus),
            withLatestFrom(
                this.store.pipe(select(DCFSelectors.getDCFId)),
                this.store.pipe(select(DCFSelectors.getSampleFromUrl))
            ),
            switchMap(([action, dcfId, sample]) =>
                this.dcfService
                    .updateMatchingResultStatus(
                        dcfId?.toString(),
                        sample?.id?.toString(),
                        action.jarCode,
                        action.statusSpecificCode
                    )
                    .pipe(
                        concatMap(() => this.dcfService.getDCF(dcfId || -1)),
                        map((dcfWrapper) => ({
                            dcfWrapper,
                            statusSpecificCode: action.statusSpecificCode,
                        }))
                    )
            ),
            map((data) =>
                DCFActions.UpdateMatchingResultStatusSuccess({
                    updatedDCF: data.dcfWrapper.data,
                    statusSpecificCode: data.statusSpecificCode,
                })
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(DCFActions.UpdateMatchingResultStatusError()))
            )
        )
    );

    updateMatchingResultStatusSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DCFActions.UpdateMatchingResultStatusSuccess),
            switchMap(() => [DCFActions.BackToViewDCF()])
        )
    );

    constructor(
        private store: Store<fromRootStore.IState>,
        private actions$: Actions,
        private athleteService: AthleteService,
        private dcfService: DCFService,
        private genericActivityService: GenericActivityApiService,
        private majorEventService: MajorEventApiService
    ) {}

    private handleDCFError(error: any): Exception {
        if (error && error.status === 409) return new ConflictException(error);
        return new Exception(error?.status, error?.code, error?.message, error?.messageKey);
    }

    private navigateToClassic(targetObject: string, objectId: string) {
        const adamsUrl = removeLastSlash(environment.adamsUrl);
        let paramName;

        if (targetObject === 'MissionOrder') paramName = 'id';
        if (targetObject === 'Athlete') paramName = 'athleteId';

        if (paramName) {
            const url = `${adamsUrl}/requestView${targetObject}.do?${paramName}=${objectId}&fromTree=true&refreshNeeded=true&frameset=full&fromNG=true`;
            window.location.href = url;
        }
    }

    private static canGetAthlete(test: Test, id: number | null, testId: number): boolean {
        return Boolean(
            test &&
                test.id === testId.toString() &&
                test.athlete !== null &&
                test.athlete.id === id &&
                id !== undefined &&
                id !== null
        );
    }
}
