import { DCFActionRight, FieldsSecurity, GenericStatus, SampleTypeEnum, SpecificCode } from '@shared/models';
import { AthleteInformation, DCF, DCFMode, LabResult, Result, Sample, SampleInformation } from '@dcf/models';
import { select, Store } from '@ngrx/store';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import { ActivatedRoute } from '@angular/router';
import { TranslationService } from '@core/services';
import { filter, map, take } from 'rxjs/operators';
import { isNotNull, isNullOrBlank } from '@shared/utils';
import { Moment } from 'moment';
import * as moment from 'moment';
import { RejectConfirmModalComponent } from '@shared/components/reject-confirm/reject-confirm-modal.component';

type OptionalSample = Sample | null | undefined;

@Component({
    selector: 'app-results-verification',
    templateUrl: './view-results-verification.html',
    styleUrls: ['./view-results-verification.scss'],
})
export class ViewResultsVerificationComponent implements OnInit, OnDestroy {
    readonly actionRight = DCFActionRight;

    readonly status = SpecificCode;

    actions$: Observable<Array<string>> = this.store.pipe(
        select(fromStore.getFieldsSecurity),
        filter(isNotNull),
        map((security: FieldsSecurity) => security.actions)
    );

    arrivalDate$: Observable<Moment | undefined> = this.store.select(fromStore.getArrivalDate);

    athlete$: Observable<AthleteInformation> = this.store.select(fromStore.getSourceAthlete);

    athleteId$: Observable<number> = this.store.pipe(
        select(fromStore.getAthlete),
        filter(isNotNull),
        map((athlete: AthleteInformation) => athlete.id),
        filter(isNotNull)
    );

    dcf$: Observable<DCF | null> = this.store.select(fromStore.getCurrentDCF);

    fieldsMismatches$: Observable<Array<string>> = this.store.select(fromStore.getSampleToLabResultMismatches);

    labResult$: Observable<LabResult | undefined> = this.store.select(fromStore.getLabResult);

    matchingResultStatus$: Observable<GenericStatus | null | undefined> = this.store.select(
        fromStore.getMatchingResultStatusFromUrl
    );

    sample$: Observable<OptionalSample> = this.store.select(fromStore.getSampleFromUrl);

    translations$ = this.translationService.translations$;

    arrivalDate: Moment | undefined;

    dcfId: string | null = null;

    dcfRetentionPeriod: string | null = null;

    isBloodPassport = false;

    formattedCollectionDate: string | null = null;

    jarCode: string | null = null;

    sampleInformation: SampleInformation | null = null;

    private hasUnmatchedLabResults = false;

    private subscriptions = new Subscription();

    @ViewChild('rejectConfirmModalRef')
    rejectConfirmModalRef?: RejectConfirmModalComponent;

    isRejectMatch = false;

    constructor(
        private store: Store<fromRootStore.IState>,
        private translationService: TranslationService,
        public activatedRoute: ActivatedRoute
    ) {
        this.dcfId = activatedRoute.snapshot.paramMap.get('id');
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        if (this.dcfId) {
            this.store.dispatch(fromStore.InitViewMatchingResults({ dcfId: +this.dcfId }));
        }

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
            this.store.select(fromStore.getSampleInformation).subscribe((sampleInformation) => {
                this.sampleInformation = sampleInformation;
            })
        );

        this.subscriptions.add(
            this.arrivalDate$.subscribe((arrivalDate) => {
                this.arrivalDate = arrivalDate;
            })
        );

        this.subscriptions.add(
            this.athleteId$.subscribe((athleteId: number) => {
                this.store.dispatch(fromStore.GetAthlete({ id: athleteId.toString(), mode: DCFMode.Edit }));
            })
        );

        this.sample$.pipe(take(1)).subscribe((sample: Sample | null | undefined) => {
            if (sample) {
                this.store.dispatch(fromStore.SaveSampleInState({ sample }));
            }
        });

        this.subscriptions.add(
            this.store.select(fromStore.getSampleFromUrl).subscribe((sample: Sample | null | undefined) => {
                if (sample) {
                    this.isBloodPassport = sample.sampleTypeSpecificCode === SampleTypeEnum.BloodPassport;
                    this.formattedCollectionDate = moment(sample.collectionDate).format('YYYY-MM-DD') || '';
                }
            })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getMatchingResultFromUrl)
                .subscribe((matchingResult: Result | null | undefined) => {
                    if (matchingResult) {
                        this.jarCode = matchingResult.sampleJarCode;
                    }
                })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getLabResultId).subscribe((labResultId: string | null | undefined) => {
                if (labResultId) {
                    this.store.dispatch(
                        fromStore.GetLabResult({
                            labResultId,
                            isBloodPassport: this.isBloodPassport,
                        })
                    );
                }
            })
        );
    }

    confirmMatch(): void {
        this.updateMatchingResultStatus(SpecificCode.ConfirmedByUser);
    }

    dcfToBeDeleted(): boolean {
        if (isNullOrBlank(this.arrivalDate?.toString())) {
            return false;
        }

        const currentDate = moment();
        const monthsDifference = currentDate.diff(this.arrivalDate, 'months');

        return monthsDifference > Number(this.dcfRetentionPeriod) && this.hasUnmatchedLabResults;
    }

    isLastMatchedSample(): boolean {
        return this.sampleInformation?.samples.filter((sample) => sample.results.length > 0).length === 1;
    }

    rejectMatch(): void {
        this.updateMatchingResultStatus(SpecificCode.MatchRejectedByUser);
    }

    private updateMatchingResultStatus(statusSpecificCode: string): void {
        if (this.jarCode) {
            this.store.dispatch(
                fromStore.UpdateMatchingResultStatus({
                    jarCode: this.jarCode,
                    statusSpecificCode,
                })
            );
        }
    }

    showRejectOrConfirmModal(isRejectMatch: boolean): void {
        this.isRejectMatch = isRejectMatch;
        if (this.rejectConfirmModalRef) {
            this.rejectConfirmModalRef.show();
        }
    }
}
