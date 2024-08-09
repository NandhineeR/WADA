import { Action, select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NEVER, Observable, combineLatest, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, switchMapTo, take, tap, withLatestFrom } from 'rxjs/operators';
import {
    AthleteGroup,
    IncompatibleTestParticipantDiscipline,
    SearchAthleteResult,
    TestingOrder,
    TestingOrderMode,
    TestStatuses,
} from '@to/models';
import * as fromRootStore from '@core/store';
import { Injectable } from '@angular/core';
import { TOApiService } from '@to/services';
import * as RouterActions from '@core/store/actions/router.actions';
import { isNotNull, isNullOrBlank, TESTING_ORDER, UNSUCCESSFUL_ATTEMPT } from '@shared/utils';
import { ConflictException, Exception, UnprocessableEntityError } from '@core/models';
import {
    Attachment,
    GenericActivity,
    ListItem,
    MajorEvent,
    SecurityWrapper,
    StatusEnum,
    SpecificCode,
    GenericActivityTypeEnum,
    TOItem,
} from '@shared/models';
import * as TOActions from '@to/store/actions';
import * as TOSelectors from '@to/store/selectors/to.selectors';
import * as AutoCompletesActions from '@autocompletes/store/actions';
import * as AutoCompletesSelectors from '@autocompletes/store/selectors';
import * as SampleManagementActions from '@sampleManagement/store/actions';
import { GenericActivityApiService, MajorEventApiService } from '@shared/services';

@Injectable()
export class TOEffects {
    backToTestCenter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.BackToTestCenter),
            map(() => TOActions.GoToTestCenter())
        )
    );

    backToTestingOrderList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.BackToTestingOrderManagement),
            map(() => {
                return RouterActions.Go({ path: ['tos'] });
            })
        )
    );

    backToViewTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.BackToViewTestingOrder),
            map(() => TOActions.ResetTestingOrder())
        )
    );

    bindAthleteToTest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step2BindAthleteToTest),
            switchMap((action) => this.testingOrderService.bindAthleteToTest(action.testId, action.athleteId)),
            switchMap(() => [TOActions.Step2BindAthleteToTestSuccess(), SampleManagementActions.NotifyTestingOrder()]),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step2BindAthleteToTestError()))
            )
        )
    );

    cancelChangeTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CancelChangeTestingOrder),
            switchMap((action) => {
                if (action.mode === TestingOrderMode.Create) {
                    return [TOActions.BackToTestingOrderManagement()];
                }
                if (action.mode === TestingOrderMode.Edit) {
                    return [TOActions.BackToViewTestingOrder()];
                }
                return [];
            })
        )
    );

    cancelTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CancelTestingOrder),
            switchMap((action) =>
                this.testingOrderService.changeTestingOrderStatus(action.reason, StatusEnum.Cancelled)
            ),
            switchMap(() => [TOActions.CancelTestingOrderSuccess(), SampleManagementActions.NotifyTestingOrder()]),
            catchError((effect: Observable<Action>) => effect.pipe(startWith(TOActions.CancelTestingOrderError())))
        )
    );

    cancelTestingOrderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CancelTestingOrderSuccess),
            withLatestFrom(this.store.pipe(select(TOSelectors.getTOId))),
            filter(([, toId]: [Action, any]) => isNotNull(toId)),
            switchMap(([, toId]: [Action, number]) => [TOActions.GetTestingOrder({ id: toId.toString() })])
        )
    );

    cancelTests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CancelTests),
            tap(() => TOActions.CleanCancelledTests()),
            filter((action) => action.testsToCancel.length > 0),
            switchMap((action) => this.testingOrderService.updateTestStatuses(action.testsToCancel)),
            switchMap((tests: any) => [
                TOActions.CancelTestsSuccess({ tests }),
                SampleManagementActions.NotifyTestingOrder(),
            ]),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.CancelTestsError()))
            )
        )
    );

    closedAnalysis$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CloseAnalysis),
            tap(() => TOActions.CleanClosedAnalysis()),
            filter((action) => !isNullOrBlank(action.testId) && !isNullOrBlank(action.analysisId)),
            switchMap((action) => this.testingOrderService.updateAnalysis(action.testId, action.analysisId)),
            switchMap((analysis: any) => [
                TOActions.CloseAnalysisSuccess({ analysis }),
                SampleManagementActions.NotifyTestingOrder(),
            ]),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.CloseAnalysisError()))
            )
        )
    );

    closedSampleNotCollected$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CloseTests),
            tap(() => TOActions.CleanClosedTests()),
            filter((action) => action.testsToClose.length > 0),
            switchMap((action) => this.testingOrderService.updateTestStatuses(action.testsToClose)),
            switchMap((tests: any) => [
                TOActions.CloseTestsSuccess({ tests }),
                SampleManagementActions.NotifyTestingOrder(),
            ]),
            catchError((_error: any, effect: Observable<Action>) => effect.pipe(startWith(TOActions.CloseTestsError())))
        )
    );

    completeTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CompleteTestingOrder),
            switchMap((action) =>
                this.testingOrderService.changeTestingOrderStatus(action.reason, StatusEnum.Completed)
            ),
            switchMap(() => [TOActions.CompleteTestingOrderSuccess(), SampleManagementActions.NotifyTestingOrder()]),
            catchError((error: any, effect: Observable<Action>) => {
                const exception = this.handleTestingOrderError(error.error);
                return effect.pipe(startWith(TOActions.CompleteTestingOrderError({ error: exception })));
            })
        )
    );

    completeTestingOrderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.CompleteTestingOrderSuccess),
            switchMapTo(this.store.pipe(select(TOSelectors.getTOId))),
            filter(isNotNull),
            map((id: number) => TOActions.GetTestingOrder({ id: id.toString() }))
        )
    );

    deleteTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.DeleteTestingOrder),
            switchMap((action) => this.testingOrderService.deleteTestingOrder(action.testingOrderId, action.reason)),
            map(() => TOActions.DeleteTestingOrderSuccess()),
            catchError((effect: Observable<Action>) => effect.pipe(startWith(TOActions.DeleteTestingOrderError())))
        )
    );

    getAthleteGroups$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step2GetAthleteGroups),
            switchMap(() => this.store.pipe(select(TOSelectors.getTO))),
            switchMap((to: TestingOrder) => {
                const testingAuthorityId = to.testingAuthority?.id || null;
                const statusSpecificCode = to.testingOrderStatus?.specificCode || SpecificCode.NotProcessed;
                const plannedStartDate = to.startDate?.toDate() || null;

                return this.testingOrderService.getAthleteGroups(
                    plannedStartDate,
                    testingAuthorityId,
                    statusSpecificCode
                );
            }),
            map((athleteGroups: Array<AthleteGroup>) => TOActions.Step2GetAthleteGroupsSuccess({ athleteGroups })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step2GetAthleteGroupsError()))
            )
        )
    );

    getAttachments = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetAttachments),
            switchMap((action) => this.testingOrderService.getAttachments(action.toId, action.types)),
            map((attachments: Array<Attachment>) => TOActions.GetAttachmentsSuccess({ attachments }))
        )
    );

    getCondensedTestingOrders$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetCondensedTestingOrders),
            withLatestFrom(this.store.pipe(select(TOSelectors.getTestingOrderItems))),
            switchMap(([action, testingOrders]: [any, Array<TOItem>]) => {
                if (testingOrders.length === 0) {
                    return this.testingOrderService.getCondensedTestingOrders(action.statuses);
                }
                return of(testingOrders);
            }),
            map((testingOrders: Array<TOItem>) => TOActions.GetCondensedTestingOrdersSuccess({ testingOrders })),
            catchError((effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.GetCondensedTestingOrdersError()))
            )
        )
    );

    getCopyTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetCopyTestingOrder),
            switchMap((action) => this.testingOrderService.getCopyTO(action.id)),
            switchMap((to: TestingOrder) => [TOActions.GetCopyTestingOrderSuccess({ to })]),
            catchError((error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(TOActions.SetErrorAndResetTestingOrder(error)));
            })
        )
    );

    getDcoReportAttachment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetDcoReportAttachment),
            switchMap((action) => this.testingOrderService.getAttachmentUrl(action.toId, action.fileKey)),
            map((attachment: Attachment) => TOActions.GetDcoReportAttachmentSuccess({ url: attachment.url }))
        )
    );

    getGenericActivities$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetGenericActivities),
            switchMap((action) =>
                this.genericActivityService.getGenericActivities(
                    GenericActivityTypeEnum.MISSION_ORDER.toString(),
                    GenericActivityTypeEnum.MISSION_ORDER.toString(),
                    action.toId
                )
            ),
            map((genericActivities: Array<GenericActivity>) =>
                TOActions.GetGenericActivitiesSuccess({ genericActivities })
            ),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(TOActions.GetGenericActivitiesError()));
            })
        )
    );

    getIncompatibleTestParticipants = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetIncompatibleTestParticipants),
            withLatestFrom(this.store.pipe(select(TOSelectors.getIncompatibleTestParticipants))),
            filter(
                ([, incompatibleTestParticipants]: [any, Array<IncompatibleTestParticipantDiscipline>]) =>
                    (incompatibleTestParticipants || []).length === 0
            ),
            switchMap(([action]: [any, any]) =>
                this.testingOrderService.getIncompatibleParticipantsDisciplines(action.id)
            ),
            switchMap((incompatibleTestParticipantDisciplines: Array<IncompatibleTestParticipantDiscipline>) => [
                TOActions.GetIncompatibleTestParticipantsSuccess({
                    incompatibleTestParticipants: incompatibleTestParticipantDisciplines,
                }),
            ]),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.GetIncompatibleTestParticipantsError()))
            )
        )
    );

    getMajorEvent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step1GetMajorEvent),
            switchMap((action) => this.majorEventService.getMajorEvent(action.majorEventId)),
            map((majorEvent: MajorEvent) => TOActions.Step1GetMajorEventSuccess({ majorEvent })),
            catchError((error, effect: Observable<Action>) => {
                return effect.pipe(startWith(TOActions.Step1GetMajorEventError(error)));
            })
        )
    );

    getMajorEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetMajorEvents),
            withLatestFrom(this.store.pipe(select(TOSelectors.getMajorEvents))),
            switchMap(([action, majorEvents]: [any, Array<ListItem>]) => {
                if (majorEvents.length === 0) {
                    return this.majorEventService.getMajorEvents(action.numberPriorMonths);
                }
                return of(majorEvents);
            }),
            map((majorEvents: Array<ListItem>) => TOActions.GetMajorEventsSuccess({ majorEvents })),
            catchError((error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.GetMajorEventsError(error)))
            )
        )
    );

    getStep1AutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step1GetAutoCompletes),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getTestingOrderSectionAuthorizationAutoCompletes))
            ),
            switchMap(([, step1]: [Action, any]) => {
                this.store.dispatch(AutoCompletesActions.GetTestingOrderAdos());
                this.store.dispatch(AutoCompletesActions.GetTestingOrderDtps());
                if (!step1?.competitionCategories?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderCompetitionCategories());
                }
                if (!step1?.organizationRelationships?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderOrganizationRelationships());
                }
                return [];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step1GetAutoCompletesError()))
            )
        )
    );

    /**
     * For consistency's sake, maintain it, although it's no longer in use
     * since all step 2 autocompletes are now retrieved in the preload action.
     */
    getStep2AutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step2GetAutoCompletes),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getTestingOrderSectionAthleteAndAnalysesAutoCompletes))
            ),
            switchMap(([,]: [Action, any]) => {
                return [];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step2GetAutoCompletesError()))
            )
        )
    );

    getStep3AutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step3GetAutoCompletes),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getTestingOrderSectionDopingControlPersonelAutoCompletes))
            ),
            switchMap(([, step3]: [Action, any]) => {
                if (!step3?.dcos?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderDcos());
                }
                if (!step3?.participantStatuses?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderParticipantStatuses());
                }
                if (!step3?.participantTypes?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderParticipantTypes());
                }
                return [];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step3GetAutoCompletesError()))
            )
        )
    );

    getStep4AutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step4GetAutoCompletes),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getTestingOrderSectionTestParticipantsAutoCompletes))
            ),
            switchMap(([, step4]: [Action, any]) => {
                if (!step4?.bloodOfficials?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderBloodOfficials());
                }
                if (!step4?.moParticipants?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderMOParticipants());
                }
                if (!step4?.notifyingChaperones?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderNotifyingChaperones());
                }
                if (!step4?.participantStatuses?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderParticipantStatuses());
                }
                if (!step4?.participantTypes?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderParticipantTypes());
                }
                if (!step4?.witnessChaperones?.length) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderWitnessChaperones());
                }
                return [];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step4GetAutoCompletesError()))
            )
        )
    );

    getTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetTestingOrder),
            switchMap((action) => this.testingOrderService.getTestingOrder(action.id)),
            switchMap((wrapper: SecurityWrapper<TestingOrder>) => [
                TOActions.GetTestingOrderSuccess({ to: wrapper.data }),
                TOActions.GetIncompatibleTestParticipants({ id: wrapper.data.id }),
                TOActions.SetSecurity({
                    fields: wrapper.fields,
                    actions: [...wrapper.actions],
                }),
            ]),
            catchError((error: any, effect: Observable<Action>) => {
                if (error.status === 404) {
                    return effect.pipe(startWith(TOActions.SetErrorAndResetTestingOrder(error)));
                }
                const exception: UnprocessableEntityError = new UnprocessableEntityError(error.error);
                if (error.status === 422) {
                    return effect.pipe(
                        startWith(
                            TOActions.GetTestingOrderError({
                                error: exception,
                                isUnprocessableEntityError: true,
                            })
                        )
                    );
                }
                return effect.pipe(
                    startWith(
                        TOActions.GetTestingOrderError({
                            error: exception,
                            isUnprocessableEntityError: false,
                        })
                    )
                );
            })
        )
    );

    /**
     * Triggers the first selection of a Major Event if there is any value coming from the retrieved Testing Order
     */
    getTestingOrderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetTestingOrderSuccess),
            tap((action: any) => this.store.dispatch(TOActions.GetGenericActivities({ toId: action.to.id }))),
            switchMap<Action, Observable<any>>(() =>
                this.store.pipe(select(TOSelectors.getTOMajorEventId), filter(Boolean))
            ),
            map((majorEventId) => TOActions.Step1GetMajorEvent({ majorEventId: majorEventId.toString() }))
        )
    );

    getTestStatuses$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step2GetTestStatuses),
            withLatestFrom(this.store.pipe(select(TOSelectors.getTestStatuses))),
            filter(([, testStatuses]: [any, TestStatuses | null]) => !testStatuses || testStatuses.isEmpty()),
            switchMap(([action]: [any, any]) => this.testingOrderService.getTestStatuses(action.testType)),
            map((statuses: TestStatuses) => TOActions.Step2GetTestStatusesSuccess({ statuses })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step2GetTestStatusesError()))
            )
        )
    );

    getTestingOrderRows$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GetTestingOrderRows),
            switchMap((action) => this.testingOrderService.getTestingOrders(action.searchCriteria)),
            map((testingOrders: Array<TOItem>) => {
                return TOActions.GetTestingOrderRowsSuccess({ testingOrders });
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.GetTestingOrderRowsError()))
            )
        )
    );

    goToCreateTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GoToCreateTestingOrder),
            map((action) =>
                RouterActions.Go({
                    path: ['to', 'new'],
                    query: { copiedTestingOrderNumber: action.copiedTestingOrderNumber },
                })
            )
        )
    );

    goToTestCenter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GoToTestCenter),
            map(() => {
                return RouterActions.Go({ path: [''] });
            })
        )
    );

    goToViewTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.GoToViewTestingOrder),
            map((action) => RouterActions.Go({ path: ['to', 'view', action.id] }))
        )
    );

    initCreateTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.InitCreateTestingOrder),
            withLatestFrom(this.store.pipe(select(fromRootStore.getActiveRouteQueryParams))),
            switchMap(
                ([, from]): Observable<Action> => {
                    if (from.copiedTestingOrderNumber) {
                        this.store.dispatch(TOActions.GetCopyTestingOrder({ id: from.copiedTestingOrderNumber }));
                    }
                    return of();
                }
            )
        )
    );

    initEditTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.InitEditTestingOrder),
            switchMap((action) => {
                return [TOActions.GetTestingOrder({ id: action.toId })];
            })
        )
    );

    initStep1$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step1Init),
            map(() => TOActions.Step1GetAutoCompletes())
        )
    );

    /**
     * For consistency's sake, maintain it, although it's no longer in use
     * since all step 2 autocompletes are now retrieved in the preload action.
     */
    initStep2$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step2Init),
            switchMap(() => [TOActions.Step2GetAutoCompletes()])
        )
    );

    initStep3$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step3Init),
            switchMap(() => [TOActions.Step3GetAutoCompletes()])
        )
    );

    initStep4$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step4Init),
            switchMap(() => [TOActions.Step4GetAutoCompletes()])
        )
    );

    issueTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.IssueTestingOrder),
            switchMap((action) => this.testingOrderService.changeTestingOrderStatus(action.reason, StatusEnum.Issued)),
            map(() => TOActions.IssueTestingOrderSuccess()),
            catchError((error: any, effect: Observable<Action>) => {
                const exception = this.handleTestingOrderError(error.error);
                return effect.pipe(startWith(TOActions.IssueTestingOrderError({ error: exception })));
            })
        )
    );

    issueTestingOrderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.IssueTestingOrderSuccess),
            switchMapTo(this.store.pipe(select(TOSelectors.getTOId))),
            filter(isNotNull),
            map((id: number) => TOActions.GetTestingOrder({ id: id.toString() }))
        )
    );

    moveToTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.MoveToTestingOrder),
            switchMap((action) => this.testingOrderService.moveTestsToTestingOrder(action.testsToMove)),
            map((tests: any) => TOActions.MoveToTestingOrderSuccess({ tests })),
            catchError((effect: Observable<Action>) => effect.pipe(startWith(TOActions.MoveToTestingOrderError())))
        )
    );

    moveToTestingOrderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.MoveToTestingOrderSuccess),
            switchMap(() => [TOActions.BackToViewTestingOrder()])
        )
    );

    navigateToTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RouterActions.RouterActive),
            switchMap((action) => {
                return action.routerState.module.includes(TESTING_ORDER) &&
                    action.routerState.url.includes('view') &&
                    !action.routerState.module.includes(UNSUCCESSFUL_ATTEMPT)
                    ? of(
                          TOActions.GetTestingOrder({
                              id: action.routerState.params.id,
                          })
                      )
                    : NEVER;
            })
        )
    );

    preloadAutoCompletesCreateOrEdit$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.PreloadAutoCompletesCreateOrEdit),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesLaboratories), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSportDisciplines), take(1)),
                ])
            ),
            switchMap(([countriesWithRegions, laboratories, sampleTypes, sportDisciplines]: [any, any, any, any]) => {
                if (countriesWithRegions.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderCountriesWithRegions());
                }
                if (laboratories.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderLaboratories());
                }
                if (sampleTypes.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderSampleTypes());
                }
                if (sportDisciplines.length === 0) {
                    this.store.dispatch(AutoCompletesActions.GetTestingOrderSportDisciplines());
                }
                return [TOActions.PreloadAutoCompletesCreateOrEditSuccess()];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.PreloadAutoCompletesCreateOrEditError()))
            )
        )
    );

    preloadAutoCompletesView$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.PreloadAutoCompletesView),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesLaboratories), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSportDisciplines), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesParticipantStatuses), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesParticipantTypes), take(1)),
                ])
            ),
            switchMap(
                ([countriesWithRegions, laboratories, sampleTypes, sportDisciplines, statuses, types]: [
                    any,
                    any,
                    any,
                    any,
                    any,
                    any
                ]) => {
                    if (countriesWithRegions.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetTestingOrderCountriesWithRegions());
                    }
                    if (laboratories.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetTestingOrderLaboratories());
                    }
                    if (sampleTypes.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetTestingOrderSampleTypes());
                    }
                    if (sportDisciplines.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetTestingOrderSportDisciplines());
                    }
                    if (statuses.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetTestingOrderParticipantStatuses());
                    }
                    if (types.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetTestingOrderParticipantTypes());
                    }
                    return [TOActions.PreloadAutoCompletesViewSuccess()];
                }
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.PreloadAutoCompletesViewError()))
            )
        )
    );

    preloadDCFAutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.PreloadDCFAutoCompletes),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesAdos), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesDtps), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesIdentificationDocuments), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesManufacturers), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSelectionCriteria), take(1)),
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesTimezones), take(1)),
                ])
            ),
            switchMap(
                ([ados, dtps, identificationDocuments, manufacturers, selectionCriteria, timezones]: [
                    any,
                    any,
                    any,
                    any,
                    any,
                    any
                ]) => {
                    if (ados.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFAdos());
                    }
                    if (dtps.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFDtps());
                    }
                    if (identificationDocuments.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFIdentificationDocuments());
                    }
                    if (manufacturers.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFManufacturers());
                    }
                    if (selectionCriteria.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFSelectionCriteria());
                    }
                    if (timezones.length === 0) {
                        this.store.dispatch(AutoCompletesActions.GetDCFTimezones());
                    }
                    return [TOActions.PreloadDCFAutoCompletesSuccess()];
                }
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.PreloadDCFAutoCompletesError()))
            )
        )
    );

    resetTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.ResetTestingOrder),
            switchMapTo(this.store.pipe(select(TOSelectors.getTOId))),
            filter(isNotNull),
            map((toId: number | null) => TOActions.GoToViewTestingOrder({ id: toId }))
        )
    );

    saveTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.SaveTestingOrder),
            switchMap(() => this.store.pipe(select(TOSelectors.getTO), take(1))),
            switchMap((to: TestingOrder) => this.testingOrderService.saveTO(to)),
            switchMap((toWrapper: SecurityWrapper<TestingOrder>) => [
                TOActions.SaveTestingOrderSuccess({ to: toWrapper.data }),
                TOActions.BackToViewTestingOrder(),
                SampleManagementActions.NotifyTestingOrder(),
            ]),
            catchError((error, effect: Observable<Action>) => {
                const exception = this.handleTestingOrderError(error.error);
                return effect.pipe(startWith(TOActions.SaveTestingOrderError({ error: exception })));
            })
        )
    );

    searchAthletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step2SearchAthletes),
            withLatestFrom(this.store.pipe(select(TOSelectors.getTO))),
            switchMap(([action, to]: [any, TestingOrder]) => {
                const testingAuthorityId = to.testingAuthority?.id || null;
                const statusSpecificCode = to.testingOrderStatus?.specificCode || SpecificCode.NotProcessed;
                const plannedStartDate = to.startDate?.toDate() || null;

                return this.testingOrderService.getSearchAthletes(
                    action.searchString,
                    plannedStartDate,
                    testingAuthorityId,
                    statusSpecificCode
                );
            }),
            map((searchAthletes: Array<SearchAthleteResult>) =>
                TOActions.Step2SearchAthletesSuccess({ searchAthletes })
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TOActions.Step2SearchAthletesError()))
            )
        )
    );

    searchAthletesClear$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TOActions.Step2SearchAthletesClear),
            switchMap(() => [TOActions.Step2SearchAthletesClose()])
        )
    );

    submitStep$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                TOActions.Step1SubmitForm,
                TOActions.Step2SubmitForm,
                TOActions.Step3SubmitForm,
                TOActions.Step4SubmitForm
            ),
            switchMap(() => this.store.pipe(select(TOSelectors.getSubmitCurrentStep), take(1))),
            switchMap((saving: boolean) => {
                if (saving) {
                    return [TOActions.SubmitCurrentStepSuccess(), TOActions.SaveTestingOrder()];
                }
                return [TOActions.SubmitCurrentStepSuccess()];
            })
        )
    );

    constructor(
        private store: Store<fromRootStore.IState>,
        private actions$: Actions,
        private genericActivityService: GenericActivityApiService,
        private majorEventService: MajorEventApiService,
        private testingOrderService: TOApiService
    ) {}

    private handleTestingOrderError(error: any): Exception {
        if (!error) return new Exception();
        if (error.status === 409) return new ConflictException(error);
        return new Exception(error.status, error.code, error.message, error.messageKey);
    }
}
