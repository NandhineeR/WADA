import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    TestStatusUpdate,
    IncompatibleTestParticipantDiscipline,
    TestsMover,
    OrganizationRelationship,
    SearchAthleteResult,
    Test,
    TestStatuses,
    TestingOrder,
    AthleteGroup,
    AnalysisUpdate,
    SearchCriteria,
} from '@to/models';
import { environment } from '@env';
import {
    Analysis,
    Attachment,
    GenericStatus,
    Reason,
    SecurityWrapper,
    SpecificCode,
    StatusEnum,
    StatusUpdate,
    TOItem,
} from '@shared/models';
import { convertDateToUTCString } from '@shared/utils';
import { statusEnumToSpecificCode, testStatusUpdateToTestUpdate } from '@to/mappers';
import { OwnerType } from '@shared/models/enums/owner-type.enum';

@Injectable()
export class TOApiService {
    private readonly endpoint = `${environment.clientApiBaseUrl}/to`;

    constructor(private http: HttpClient) {}

    bindAthleteToTest(testId: string, athleteId: string): Observable<void> {
        const params = new HttpParams();
        return this.http.put<void>(`${this.endpoint}/bind-athlete-to-test/test/${testId}/athlete/${athleteId}`, {
            params,
        });
    }

    changeTestingOrderStatus(reason: Reason, statusEnum: StatusEnum): Observable<HttpResponse<void>> {
        const toId = reason.objectId;
        const statusSpecificCode = statusEnumToSpecificCode(statusEnum);
        const statusUpdate = new StatusUpdate({ statusSpecificCode, reason: reason.details });

        return this.http.put<void>(`${this.endpoint}/${toId}/status`, statusUpdate, { observe: 'response' });
    }

    deleteTestingOrder(testingOrderId: string, reason: string): Observable<void> {
        const encodedReason = btoa(reason);
        return this.http.delete<void>(`${this.endpoint}/${testingOrderId}`, {
            headers: { 'x-wada-note': encodedReason },
        });
    }

    getAthleteGroups(
        plannedStartDate: Date | null,
        taId: number | null,
        statusSpecificCode: string
    ): Observable<Array<AthleteGroup>> {
        const params = new HttpParams()
            .set('plannedStartDate', convertDateToUTCString(plannedStartDate || new Date()))
            .set('taId', taId?.toString() || '')
            .set('statusSpecificCode', statusSpecificCode);

        return this.http
            .get<Array<AthleteGroup>>(`${this.endpoint}/athlete-groups`, { params })
            .pipe(
                map((athleteGroups: Array<AthleteGroup>) =>
                    athleteGroups.map((athleteGroup) => new AthleteGroup(athleteGroup))
                )
            );
    }

    getAttachmentUrl(toId: string, fileKey: string): Observable<Attachment> {
        return this.http.get<Attachment>(`${this.endpoint}/testingorder/${toId}/attachments/${fileKey}`);
    }

    getAttachments(toId: string, types: Array<string>): Observable<Array<Attachment>> {
        const params = new HttpParams().set('types', types ? JSON.stringify(types) : '');
        return this.http.get<Array<Attachment>>(`${this.endpoint}/testingorder/${toId}/attachments`, { params });
    }

    /**
     * Get list of condensed testing orders for the "move athlete to other testing order" functionality
     */
    getCondensedTestingOrders(statuses?: Array<string>): Observable<Array<TOItem>> {
        const params = statuses ? new HttpParams().set('statuses', statuses.toString()) : undefined;
        return this.http
            .get<Array<TOItem>>(`${this.endpoint}/testing-orders/condensed`, { params })
            .pipe(map((testingOrders) => testingOrders.map((testingOrder) => new TOItem(testingOrder))));
    }

    getCopyTO(id: string): Observable<TestingOrder> {
        return this.http
            .get<TestingOrder>(`${this.endpoint}/copy/${id}`)
            .pipe(map((to: TestingOrder) => new TestingOrder(to)));
    }

    getEnterpriseProperty(property: string): Observable<any> {
        const params = new HttpParams().set('property', property);
        return this.http.get<any>(`${this.endpoint}/enterprise/property`, { params });
    }

    getIncompatibleParticipantsDisciplines(
        testingOrderId: number | null
    ): Observable<Array<IncompatibleTestParticipantDiscipline>> {
        const params = new HttpParams().set('testingOrderId', testingOrderId?.toString() || '');
        return this.http
            .get<Array<IncompatibleTestParticipantDiscipline>>(`${this.endpoint}/incompatible-participant`, { params })
            .pipe(
                map((incompatibleTestParticipantDisciplines: Array<IncompatibleTestParticipantDiscipline>) =>
                    incompatibleTestParticipantDisciplines.map(
                        (incompatibleTestParticipantDiscipline) =>
                            new IncompatibleTestParticipantDiscipline(incompatibleTestParticipantDiscipline)
                    )
                )
            );
    }

    getOrganizationRelationships(): Observable<Array<OrganizationRelationship>> {
        return this.http
            .get<Array<OrganizationRelationship>>(`${this.endpoint}/organization/relationships`)
            .pipe(
                map((organizationRelationships: Array<OrganizationRelationship>) =>
                    organizationRelationships.map(
                        (organizationRelationship) => new OrganizationRelationship(organizationRelationship)
                    )
                )
            );
    }

    getSearchAthletes(
        searchString: string,
        plannedStartDate: Date | null,
        taId: number | null,
        statusSpecificCode: string
    ): Observable<Array<SearchAthleteResult>> {
        const params = new HttpParams()
            .set('searchString', searchString)
            .set('includeAllAthletes', 'true')
            .set('plannedStartDate', convertDateToUTCString(plannedStartDate || new Date()))
            .set('taId', taId?.toString() || '')
            .set('statusSpecificCode', statusSpecificCode);
        return this.http
            .get<Array<SearchAthleteResult>>(`${this.endpoint}/athletes/search`, { params })
            .pipe(
                map((athletes: Array<SearchAthleteResult>) =>
                    athletes.map((athlete) => new SearchAthleteResult(athlete))
                )
            );
    }

    getTeamsByAthlete(id: string): Observable<TestingOrder> {
        const params = new HttpParams().set('athleteId', id);

        return this.http
            .get<TestingOrder>(this.endpoint, { params })
            .pipe(map((to: TestingOrder) => new TestingOrder(to)));
    }

    getTestingOrder(id: string): Observable<SecurityWrapper<TestingOrder>> {
        const params = new HttpParams().set('toId', id);

        return this.http
            .get<SecurityWrapper<TestingOrder>>(this.endpoint, { params })
            .pipe(map((wrapper: SecurityWrapper<TestingOrder>) => this.setTOWrapper(wrapper)));
    }

    /**
     * Get list of condensed testing orders for the "testing order management" functionality
     */
    getTestingOrders(searchCriteria?: SearchCriteria): Observable<Array<TOItem>> {
        const params = searchCriteria
            ? new HttpParams().set('searchCriteria', JSON.stringify(searchCriteria))
            : undefined;
        return this.http
            .get<Array<TOItem>>(`${this.endpoint}/testing-orders`, { params })
            .pipe(map((testingOrders) => testingOrders.map((testingOrder) => new TOItem(testingOrder))));
    }

    getTestStatuses(types: string): Observable<TestStatuses> {
        const params = new HttpParams().set('types', types);
        return this.http
            .get<TestStatuses>(`${this.endpoint}/tests/statuses`, { params })
            .pipe(map((statuses: TestStatuses) => new TestStatuses(statuses)));
    }

    moveTestToTestingOrder(testId: number | null, testingOrderId: string): Observable<Test> {
        const params = new HttpParams();
        return this.http
            .put<Test>(`${this.endpoint}/tests/${testId}/move`, { testingOrderId }, { params })
            .pipe(map((test: Test) => new Test(test)));
    }

    moveTestsToTestingOrder(testsToMove: TestsMover): Observable<Array<Test>> {
        const movedtests: Array<Observable<Test>> = testsToMove.testIds.map((testId) =>
            this.moveTestToTestingOrder(testId, testsToMove.testingOrderNumber.replace(/^\D+/, ''))
        );
        return combineLatest(movedtests);
    }

    saveTO(to: TestingOrder): Observable<SecurityWrapper<TestingOrder>> {
        const previousStatus = to.testingOrderStatus;

        return this.http.put<SecurityWrapper<TestingOrder>>(`${this.endpoint}`, to).pipe(
            map((wrapper: SecurityWrapper<TestingOrder>) => {
                wrapper.data.hasStatusChangedSinceLastSave =
                    wrapper.data.testingOrderStatus === null
                        ? false
                        : previousStatus === null || previousStatus.id !== wrapper.data.testingOrderStatus.id;
                return wrapper;
            }),
            map((wrapper: SecurityWrapper<TestingOrder>) => this.setTOWrapper(wrapper))
        );
    }

    updateAnalysis(testId: string, analysisId: string): Observable<Analysis> {
        const analysisUpdate = new AnalysisUpdate();
        analysisUpdate.status = new GenericStatus({
            specificCode: SpecificCode.Closed,
            ownerType: OwnerType.ANALYSIS_SAMPLE,
        });
        const params = new HttpParams();
        return this.http
            .put<Analysis>(`${this.endpoint}/tests/${testId}/${analysisId}`, { analysisUpdate }, { params })
            .pipe(map((analysis: Analysis) => new Analysis(analysis)));
    }

    updateTestStatus(testToUpdate: TestStatusUpdate): Observable<Test> {
        const testUpdate = testStatusUpdateToTestUpdate(testToUpdate);
        const params = new HttpParams();
        return this.http
            .put<Test>(`${this.endpoint}/tests/${testToUpdate.testId}`, { testUpdate }, { params })
            .pipe(map((test: Test) => new Test(test)));
    }

    updateTestStatuses(testsToUpdate: Array<TestStatusUpdate>): Observable<Array<Test>> {
        const updatedTests: Array<Observable<Test>> = testsToUpdate.map((test) => this.updateTestStatus(test));

        return combineLatest(updatedTests);
    }

    /**
     * Maps the security wrapper around the TO
     * @param wrapper - the security wrapper received from the api
     * @returns a new SecurityWrapper for the TO
     */
    private setTOWrapper(wrapper: SecurityWrapper<TestingOrder>): SecurityWrapper<TestingOrder> {
        return {
            fields: new Map(Object.entries(wrapper.fields)),
            actions: [...wrapper.actions],
            data: new TestingOrder(wrapper.data),
        };
    }
}
