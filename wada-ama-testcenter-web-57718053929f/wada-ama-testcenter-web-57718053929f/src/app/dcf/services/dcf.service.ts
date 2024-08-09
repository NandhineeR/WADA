import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { environment } from '@env';
import {
    MatchingStatus,
    DCF,
    DcfBinding,
    DCFStatus,
    LabResult,
    Sample,
    UrineSampleBoundaries,
    Timezone,
    TimeSlot,
    SampleValidityUpdate,
} from '@dcf/models';
import { ConflictException } from '@core/models';
import { Attachment, SampleType, SecurityWrapper, Test } from '@shared/models';
import { convertDateToString, convertMomentToString, isNullOrBlank } from '@shared/utils';
import { cloneDeep } from 'lodash-es';
import { getDcfWithModifiedFields } from '@dcf/mappers/dcf-service.mapper';
import { Moment } from 'moment';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';

class HttpOptions {
    headers?: HttpHeaders;

    params?: HttpParams;
}

@Injectable()
export class DCFService {
    private baseUrl = `${environment.clientApiBaseUrl}/dcf`;

    private lastSaveChangedDcfStatus: [number | null, boolean] = [null, false];

    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    bindDCFToTestingOrder(bindToTO: DcfBinding): Observable<SecurityWrapper<DCF>> {
        const body = {
            testId: bindToTO.testId,
            testingOrderId: bindToTO.testingOrderId,
            reason: bindToTO.reason,
        };
        return this.http.post<SecurityWrapper<DCF>>(`${this.baseUrl}/dcfs/${bindToTO.dcfId}`, body).pipe(
            map((wrapper: SecurityWrapper<DCF>) => {
                const updatedWrapper = this.setDCFWrapper(wrapper);
                updatedWrapper.data.hasStatusChangedSinceLastSave =
                    this.lastSaveChangedDcfStatus[0] === parseInt(bindToTO.dcfId, 10) &&
                    this.lastSaveChangedDcfStatus[1];
                return updatedWrapper;
            })
        );
    }

    changeDCFStatusCancel(dcfId: string, reason: string): Observable<HttpResponse<void>> {
        const params = new HttpParams().set('dcfId', dcfId);

        return this.http.post<void>(`${this.baseUrl}/cancel`, { reason }, { observe: 'response', params });
    }

    correctSampleCode(dcfId: string, sampleId: string, reason: string, sampleCode: string): Observable<void> {
        const encodedReason = btoa(reason);
        return this.http.put<void>(`${this.baseUrl}/${dcfId}/samples/${sampleId}/code`, sampleCode, {
            headers: { 'x-wada-note': encodedReason },
        });
    }

    correctSampleType(dcfId: string, sampleId: string, reason: string, sampleType: string): Observable<void> {
        const encodedReason = btoa(reason);
        return this.http.put<void>(`${this.baseUrl}/${dcfId}/samples/${sampleId}/type`, sampleType, {
            headers: { 'x-wada-note': encodedReason },
        });
    }

    createDCF(dcfData: DCF, sampleTypes: Array<SampleType> | null): Observable<SecurityWrapper<DCF>> {
        const previousStatus = dcfData.status;
        const dcfUpdatedWithNotification = this.updateTestNotificationInDcf(dcfData);
        const dcfUpdatedWithSampleInformation = this.updateSampleInformationInDcf(
            dcfUpdatedWithNotification,
            sampleTypes
        );
        const dcfUpdatedWithAnalysesSample = this.updateSampleInformationInDcfWithAnalysesDetails(
            dcfUpdatedWithSampleInformation
        );
        const dcfUpdatedWithProcedural = this.updateProceduralInformationInDcf(dcfUpdatedWithAnalysesSample);
        const response = this.http.put<SecurityWrapper<DCF>>(`${this.baseUrl}`, dcfUpdatedWithProcedural);
        return this.mapSaveResponse(response, previousStatus);
    }

    deleteDCF(dcfId: string, reason: string): Observable<void> {
        const encodedReason = btoa(reason);
        return this.http.delete<void>(`${this.baseUrl}/${dcfId}`, {
            headers: { 'x-wada-note': encodedReason },
        });
    }

    deleteMatchingResult(dcfId: string, sampleId: string, reason: string, sampleJarCode: string): Observable<void> {
        const encodedReason = btoa(reason);
        return this.http.delete<void>(`${this.baseUrl}/${dcfId}/samples/${sampleId}/results/${sampleJarCode}`, {
            headers: { 'x-wada-note': encodedReason },
        });
    }

    executeSampleCodeValidation(dcf: DCF): Observable<Array<Sample> | ConflictException> {
        return this.http.post<Array<Sample>>(`${this.baseUrl}/sample-code-validation`, dcf).pipe(
            map((sampleList: Array<Sample> | ConflictException) => {
                if (Array.isArray(sampleList)) {
                    return sampleList.map((sample: Sample) => SampleFactory.createSample(sample));
                }
                return new ConflictException(sampleList);
            })
        );
    }

    getAttachmentUrl(dcfId: string, fileKey: string): Observable<Attachment> {
        return this.http.get<Attachment>(`${this.baseUrl}/dcfs/${dcfId}/attachments/${fileKey}`);
    }

    getAttachments(dcfId: string, types: Array<string>): Observable<Array<Attachment>> {
        const params = new HttpParams().set('types', types ? JSON.stringify(types) : '');
        return this.http.get<Array<Attachment>>(`${this.baseUrl}/dcfs/${dcfId}/attachments`, { params });
    }

    getDCF(dcfId: number): Observable<SecurityWrapper<DCF>> {
        const params = new HttpParams().set('dcfId', dcfId.toString());
        const options: HttpOptions = this.getHttpOptionsForGetDcf(params);
        return this.http.get<SecurityWrapper<DCF>>(`${this.baseUrl}`, options).pipe(
            map((wrapper: SecurityWrapper<DCF>) => {
                const updatedWrapper = this.setDCFWrapper(wrapper);
                return this.adjustDatetimePropertiesWithTimezone(updatedWrapper);
            })
        );
    }

    getDCFs(ids: Array<string>): Observable<Array<SecurityWrapper<DCF>>> {
        const paramValue = Array.isArray(ids) ? ids.join() : ids;
        const params = new HttpParams().set('ids', paramValue);
        const options: HttpOptions = this.getHttpOptionsForGetDcf(params);
        return this.http.get<Array<SecurityWrapper<DCF>>>(`${this.baseUrl}/dcfs`, options).pipe(
            map((dcfWithSecurities) =>
                dcfWithSecurities.map((wrapper: SecurityWrapper<DCF>) => {
                    const updatedWrapper = this.setDCFWrapper(wrapper);
                    return this.adjustDatetimePropertiesWithTimezone(updatedWrapper);
                })
            )
        );
    }

    getLabResult(labResultId: string, isBloodPassport: boolean): Observable<LabResult> {
        const params = new HttpParams();
        const labResultUrl = 'lab-results';
        const bpLabResultUrl = `bp-${labResultUrl}`;
        const url = isBloodPassport ? bpLabResultUrl : labResultUrl;
        return this.http
            .get<LabResult>(`${this.baseUrl}/${url}/${labResultId}`, { params })
            .pipe(map((result: LabResult) => new LabResult(result)));
    }

    getTempLoggerStatus(tempLoggerId: string, date: Moment): Observable<MatchingStatus> {
        const params = new HttpParams().set('date', convertMomentToString(date)).set('tempLoggerId', tempLoggerId);

        return this.http
            .get<MatchingStatus>(`${this.baseUrl}/temp-logger-status`, {
                params,
            })
            .pipe(map((tempLoggerStatus: MatchingStatus) => new MatchingStatus(tempLoggerStatus)));
    }

    getTest(id: string): Observable<Test> {
        const params = new HttpParams().set('id', id);

        return this.http
            .get<Test>(`${this.baseUrl}/test`, { params })
            .pipe(map((test: Test) => new Test(test)));
    }

    getTests(ids: Array<string>): Observable<Array<Test>> {
        const paramValue = Array.isArray(ids) ? ids.join() : ids;
        const params = new HttpParams().set('ids', paramValue);

        return this.http
            .get<Array<Test>>(`${this.baseUrl}/tests`, { params })
            .pipe(map((tests) => tests.map((test) => new Test(test))));
    }

    getTimeslots(athleteId: number, date: Date): Observable<Array<TimeSlot>> {
        const params = new HttpParams().set('date', convertDateToString(date)).set('athleteId', athleteId.toString());

        return this.http
            .get<Array<TimeSlot>>(`${this.baseUrl}/whereabouts`, { params })
            .pipe(map((timeSlots: Array<TimeSlot>) => (timeSlots || []).map((timeSlot) => new TimeSlot(timeSlot))));
    }

    getUrineBoundaries(): Observable<UrineSampleBoundaries> {
        return this.http
            .get<UrineSampleBoundaries>(`${this.baseUrl}/urineBoundaries`)
            .pipe(
                map((urineSampleBoundaries: UrineSampleBoundaries) => new UrineSampleBoundaries(urineSampleBoundaries))
            );
    }

    saveAllDCF(dcfs: Array<DCF>, sampleTypes: Array<SampleType> | null): Observable<Array<SecurityWrapper<DCF>>> {
        const savedDCF: Array<Observable<SecurityWrapper<DCF>>> = dcfs.map((dcf) =>
            dcf.id ? this.updateDCF(new DCF(), dcf, sampleTypes) : this.createDCF(dcf, sampleTypes)
        );
        return combineLatest(savedDCF);
    }

    updateDCF(originalDcf: DCF, dcfData: DCF, sampleTypes: Array<SampleType> | null): Observable<SecurityWrapper<DCF>> {
        const dcfId = dcfData?.id?.toString() || '';
        const dcfUpdatedWithNotification = this.updateTestNotificationInDcf(dcfData);
        const dcfUpdatedWithSampleInformation = this.updateSampleInformationInDcf(
            dcfUpdatedWithNotification,
            sampleTypes
        );
        const dcfUpdatedWithAnalysesSample = this.updateSampleInformationInDcfWithAnalysesDetails(
            dcfUpdatedWithSampleInformation
        );
        const dcfUpdatedWithProcedural = this.updateProceduralInformationInDcf(dcfUpdatedWithAnalysesSample);
        const dcf = getDcfWithModifiedFields(dcfUpdatedWithProcedural, originalDcf);
        const previousStatus = dcfUpdatedWithProcedural.status;
        const response = this.http.patch<SecurityWrapper<DCF>>(`${this.baseUrl}/${dcfId}`, { dcf });
        return this.mapSaveResponse(response, previousStatus);
    }

    updateMatchingResultStatus(
        dcfId: string | undefined,
        sampleId: string | undefined,
        jarCode: string,
        statusSpecificCode: string
    ): Observable<string> {
        const params = new HttpParams().set('dcfId', dcfId || '').set('sampleId', sampleId || '');
        const body = { key: jarCode, statusCode: statusSpecificCode };
        const updateMatchingResult = 'update-matching-result';
        return this.http
            .post<void>(`${this.baseUrl}/${updateMatchingResult}`, body, {
                params,
            })
            .pipe(map(() => statusSpecificCode));
    }

    updateSampleValidity(dcfId: string, sampleValidityUpdate: SampleValidityUpdate): Observable<HttpResponse<void>> {
        return this.http.put<void>(
            `${this.baseUrl}/${dcfId}/samples/${sampleValidityUpdate.sampleId}/validity`,
            sampleValidityUpdate,
            { observe: 'response' }
        );
    }

    private adjustDatetimePropertiesWithTimezone(updatedWrapper: SecurityWrapper<DCF>): SecurityWrapper<DCF> {
        if (updatedWrapper.data.notification && updatedWrapper.data.notification.notificationDate) {
            updatedWrapper.data.notification.notificationDate = moment
                .utc(this.applyTimezoneUTCToDate(updatedWrapper.data.notification.notificationDate))
                .utcOffset(this.extractGmtOffset(updatedWrapper.data.notification.timezone));
        }

        if (updatedWrapper.data.sampleInformation && updatedWrapper.data.sampleInformation.arrivalDate) {
            updatedWrapper.data.sampleInformation.arrivalDate = moment
                .utc(this.applyTimezoneUTCToDate(updatedWrapper.data.sampleInformation.arrivalDate))
                .utcOffset(this.extractGmtOffset(updatedWrapper.data.sampleInformation.timezone));
        }

        if (updatedWrapper.data.proceduralInformation && updatedWrapper.data.proceduralInformation.endOfProcedureDate) {
            updatedWrapper.data.proceduralInformation.endOfProcedureDate = moment
                .utc(this.applyTimezoneUTCToDate(updatedWrapper.data.proceduralInformation.endOfProcedureDate))
                .utcOffset(this.extractGmtOffset(updatedWrapper.data.proceduralInformation.timezone));
        }

        updatedWrapper.data.sampleInformation?.samples?.map((sample: Sample) => {
            if (sample.collectionDate) {
                sample.collectionDate = moment
                    .utc(this.applyTimezoneUTCToDate(sample.collectionDate))
                    .utcOffset(this.extractGmtOffset(sample.timezone));
            }
            return sample;
        });

        return updatedWrapper;
    }

    private applyTimezoneGmtOffsetToDate(date: Moment, gmtOffset: string): string | null {
        if (!date || !date.isValid()) return null;

        const year = date.year();
        const month = date.month() + 1;
        const day = date.date();
        const hour = date.hour();
        const minute = date.minutes();
        const seconds = '00';

        return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}T${hour < 10 ? '0' : ''}${hour}:${
            minute < 10 ? '0' : ''
        }${minute}:${seconds}${gmtOffset}`;
    }

    private applyTimezoneUTCToDate(date: Moment): string | null {
        if (!date || !date.isValid()) return null;

        const year = date.utc().year();
        const month = date.utc().month() + 1;
        const day = date.utc().date();
        const hour = date.utc().hour();
        const minute = date.utc().minutes();
        const seconds = '00';

        return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}T${hour < 10 ? '0' : ''}${hour}:${
            minute < 10 ? '0' : ''
        }${minute}:${seconds}`;
    }

    private extractGmtOffset(timezone: Timezone | null): string {
        return timezone?.shortName.substring(3) || '+00:00'; // timezone.gmtOffset has no value assigned to it
    }

    private getHttpOptionsForGetDcf(params: HttpParams): HttpOptions {
        let options: HttpOptions = { params };
        const abpAccess = this.route?.snapshot?.queryParams?.abpAccess;
        if (abpAccess) {
            const headers = new HttpHeaders().set('X-ABP-ACCESS', abpAccess);
            options = { headers, params };
        }
        return options;
    }

    /**
     * Maps response from http call that contains a SecurityWrapper<DCF> data
     */
    private mapSaveResponse(
        updatedDcf: Observable<SecurityWrapper<DCF>>,
        previousStatus: DCFStatus | null
    ): Observable<SecurityWrapper<DCF>> {
        return updatedDcf.pipe(
            map((wrapper: any) => {
                const updatedWrapper = this.setDCFWrapper(cloneDeep(wrapper));
                updatedWrapper.data.hasStatusChangedSinceLastSave =
                    updatedWrapper.data.status === null
                        ? false
                        : previousStatus === null || previousStatus.id !== updatedWrapper.data.status.id;
                this.lastSaveChangedDcfStatus = [
                    updatedWrapper.data.id,
                    updatedWrapper.data.hasStatusChangedSinceLastSave,
                ];

                return updatedWrapper;
            })
        );
    }

    private setDCFWrapper(wrapper: SecurityWrapper<DCF>): SecurityWrapper<DCF> {
        return {
            fields: new Map(Object.entries(wrapper.fields)),
            actions: [...wrapper.actions],
            data: new DCF(wrapper.data),
        };
    }

    private resetSampleValues(sample: Sample): Sample {
        if (SampleFactory.isBloodPassport(sample)) {
            sample.altitudeSimulation = sample.altitudeSimulation?.isNull() ? null : sample.altitudeSimulation;
            sample.altitudeTraining = sample.altitudeTraining?.isNull() ? null : sample.altitudeTraining;
            if (sample?.altitudeTraining?.start && sample?.altitudeTraining?.end) {
                // Determine the user's time zone offset
                const timezoneOffset = moment().utcOffset() * -1;

                // Get the user's time zone
                const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

                // Adjust the time zone offset based on the user's system
                sample.altitudeTraining.start =
                    timezoneOffset < 0
                        ? momentTimezone.tz(sample.altitudeTraining.start, timeZone).utc(true)
                        : moment.utc(this.applyTimezoneUTCToDate(moment(sample.altitudeTraining.start)));

                sample.altitudeTraining.end =
                    timezoneOffset < 0
                        ? momentTimezone.tz(sample.altitudeTraining.end, timeZone).utc(true)
                        : moment.utc(this.applyTimezoneUTCToDate(moment(sample.altitudeTraining.end)));
            }
            sample.bloodDonationOrLoss = sample.bloodDonationOrLoss?.isNull() ? null : sample.bloodDonationOrLoss;
            sample.bloodTransfusion = sample.bloodTransfusion?.isNull() ? null : sample.bloodTransfusion;
            sample.tempLoggerStatus =
                !sample.tempLoggerStatus || sample.tempLoggerStatus?.isNull()
                    ? new MatchingStatus({ code: 0, description: null })
                    : sample.tempLoggerStatus;
        }

        if (SampleFactory.isUrine(sample)) {
            sample.volume = isNullOrBlank(sample.volume?.toString()) ? null : sample.volume;
            sample.specificGravity = isNullOrBlank(sample.specificGravity) ? null : sample.specificGravity;
        }

        return sample;
    }

    private updateProceduralInformationInDcf(dcfData: DCF): DCF {
        const dcfUpdated = cloneDeep(dcfData);
        if (dcfUpdated.proceduralInformation && dcfUpdated.proceduralInformation.endOfProcedureDate) {
            /**
             * Since the arrival date and the endOfProcedure date timezones are bound, we necessarily have
             * to use the sampleInformation timezone as the proceduralInformation one is a read-only field that
             * just reflects the behavior of the former. Should it change in the future, this line of code must
             * also be updated.
             */
            const gmtOffset = dcfUpdated.sampleInformation?.timezone?.shortName.substring(3) || '+00:00';
            dcfUpdated.proceduralInformation.endOfProcedureDate = moment.parseZone(
                this.applyTimezoneGmtOffsetToDate(dcfUpdated.proceduralInformation.endOfProcedureDate, gmtOffset)
            );
        }

        return dcfUpdated;
    }

    private updateSampleInformationInDcf(dcfData: DCF, sampleTypes: Array<SampleType> | null): DCF {
        const dcfUpdated = cloneDeep(dcfData);
        if (dcfUpdated.sampleInformation) {
            if (dcfUpdated.sampleInformation.arrivalDate) {
                const arrivalDateGmtOffset = dcfUpdated.sampleInformation.timezone?.shortName.substring(3) || '+00:00';
                dcfUpdated.sampleInformation.arrivalDate = moment.parseZone(
                    this.applyTimezoneGmtOffsetToDate(dcfUpdated.sampleInformation.arrivalDate, arrivalDateGmtOffset)
                );
            }

            if (sampleTypes) {
                dcfUpdated.sampleInformation.samples = SampleFactory.setSampleTypes(
                    dcfUpdated.sampleInformation?.samples?.map((sample: Sample) => {
                        const collectionDateGmtOffset = sample.timezone?.shortName.substring(3) || '+00:00';
                        if (sample.collectionDate) {
                            sample.collectionDate = moment.parseZone(
                                this.applyTimezoneGmtOffsetToDate(sample.collectionDate, collectionDateGmtOffset)
                            );
                        }

                        return this.resetSampleValues(sample);
                    }),
                    sampleTypes
                );
            }
        }

        return dcfUpdated;
    }

    private updateSampleInformationInDcfWithAnalysesDetails(dcfData: DCF) {
        const dcfUpdated = cloneDeep(dcfData);

        if (dcfUpdated.test?.analyses && dcfUpdated.sampleInformation?.samples) {
            dcfUpdated.sampleInformation?.samples.forEach((sample: Sample) => {
                // If a sample already has a match lab result, we remove both sample and
                // analysis so that their systemLabelId is not mistakenly assigned to any
                // other sample.
                if (sample.results && sample.results.length > 0) {
                    const analysisIndex = dcfUpdated.test?.analyses.findIndex(
                        (analysis) =>
                            (analysis.systemLabelId && analysis.systemLabelId === sample.systemLabelId) ||
                            (analysis.id && analysis.id === sample.systemLabelId)
                    );
                    if (analysisIndex && analysisIndex > 0) {
                        dcfUpdated.test?.analyses.splice(analysisIndex, 1);
                    }
                    return; // continue the for-each loop iteration
                }

                // System Label information needs to be reset every time in order to ensure
                // edge-case scenarios are convered like the removal of all analyses on the
                // Testing Order side.
                sample.systemLabel = null;
                sample.systemLabelId = null;

                const analysisIndex = dcfUpdated.test?.analyses.findIndex(
                    (analysis) =>
                        analysis.laboratory?.id === sample.laboratory?.id &&
                        analysis.sampleType.id === sample.sampleType?.id
                );

                // findIndex function returns -1 in case no index is found. It can also return undefined
                if (analysisIndex !== undefined && analysisIndex >= 0) {
                    const analysis = dcfUpdated.test?.analyses.splice(analysisIndex, 1)[0];
                    sample.systemLabel = analysis?.systemLabel || null;
                    sample.systemLabelId = analysis?.id || analysis?.systemLabelId || null;
                }
            });
        }

        return dcfUpdated;
    }

    private updateTestNotificationInDcf(dcfData: DCF): DCF {
        const dcfUpdated = cloneDeep(dcfData);
        if (dcfUpdated.notification && dcfUpdated.notification.notificationDate) {
            const gmtOffset = dcfUpdated.notification.timezone?.shortName.substring(3) || '+00:00';
            dcfUpdated.notification.notificationDate = moment.parseZone(
                this.applyTimezoneGmtOffsetToDate(dcfUpdated.notification.notificationDate, gmtOffset)
            );
        }

        return dcfUpdated;
    }
}
