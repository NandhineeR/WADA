import { Test } from '@to/models';
import { Address, Athlete, MajorEvent, Phone, TOItem } from '@shared/models';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import {
    AthleteSupportPersonnel,
    BloodPassport,
    CompetitionLevelAthlete,
    SportIdentity,
    SteroidPassport,
    TestPoolParticipant,
    WhereaboutsEntry,
    WhereaboutsFailure,
} from '@athlete/models';

@Injectable()
export class AthleteService {
    private endpoint = `${environment.clientApiBaseUrl}/athlete`;

    constructor(private http: HttpClient) {}

    getAthlete(athleteId: string): Observable<Athlete> {
        const params = new HttpParams().set('athleteId', athleteId);

        return this.http
            .get<Athlete>(`${this.endpoint}/athleteAndContact`, { params })
            .pipe(map((athlete: Athlete) => new Athlete(athlete)));
    }

    getSportIdentities(athleteId: string): Observable<Array<SportIdentity>> {
        return this.http
            .get<Array<SportIdentity>>(`${this.endpoint}/${athleteId}/sport-identities`)
            .pipe(map((sportIdentities) => sportIdentities.map((sportIdentity) => new SportIdentity(sportIdentity))));
    }

    getAddresses(athleteId: string): Observable<Array<Address>> {
        return this.http
            .get<Array<Address>>(`${this.endpoint}/${athleteId}/addresses`)
            .pipe(map((addresses) => addresses.map((address) => new Address(address))));
    }

    getPhones(athleteId: string): Observable<Array<Phone>> {
        return this.http
            .get<Array<Phone>>(`${this.endpoint}/${athleteId}/phones`)
            .pipe(map((phones) => phones.map((phone) => new Phone(phone))));
    }

    getCompetitionLevels(athleteId: string): Observable<Array<CompetitionLevelAthlete>> {
        return this.http
            .get<Array<CompetitionLevelAthlete>>(`${this.endpoint}/${athleteId}/competition-levels`)
            .pipe(
                map((competitionLevels) =>
                    competitionLevels.map((competitionLevel) => new CompetitionLevelAthlete(competitionLevel))
                )
            );
    }

    getMajorEvents(athleteId: string): Observable<Array<MajorEvent>> {
        return this.http
            .get<Array<MajorEvent>>(`${this.endpoint}/${athleteId}/major-events`)
            .pipe(map((events) => events.map((event) => new MajorEvent(event))));
    }

    getBloodPassports(athleteId: string): Observable<Array<BloodPassport>> {
        return this.http
            .get<Array<BloodPassport>>(`${this.endpoint}/${athleteId}/blood-passports`)
            .pipe(map((bloodPassports) => bloodPassports.map((bloodPassport) => new BloodPassport(bloodPassport))));
    }

    getSteroidPassports(athleteId: string): Observable<Array<SteroidPassport>> {
        return this.http
            .get<Array<SteroidPassport>>(`${this.endpoint}/${athleteId}/steroid-passports`)
            .pipe(map((steroids) => steroids.map((steroid) => new SteroidPassport(steroid))));
    }

    getAthleteAgents(athleteId: string): Observable<Array<AthleteSupportPersonnel>> {
        return this.http
            .get<Array<AthleteSupportPersonnel>>(`${this.endpoint}/${athleteId}/athlete-agents`)
            .pipe(map((agents) => agents.map((agent) => new AthleteSupportPersonnel(agent))));
    }

    getTestPoolsAthletes(testPoolId: string, athleteId: string): Observable<Array<TestPoolParticipant>> {
        return this.http
            .get<Array<TestPoolParticipant>>(`${this.endpoint}/test-pools/${testPoolId}/athletes/${athleteId}`)
            .pipe(map((testPools) => testPools.map((testPool) => new TestPoolParticipant(testPool))));
    }

    getAthleteTests(athleteId: string, status: string): Observable<Array<Test>> {
        const params = new HttpParams().set('status', status);

        return this.http
            .get<Array<Test>>(`${this.endpoint}/${athleteId}/tests`, { params })
            .pipe(map((tests) => tests.map((test) => new Test(test))));
    }

    getWhereabouts(athleteId: string, startDate: Date, endDate: Date): Observable<Array<WhereaboutsEntry>> {
        const params = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
        return this.http
            .get<Array<WhereaboutsEntry>>(`${this.endpoint}/${athleteId}/whereabouts`, { params })
            .pipe(map((entries) => entries.map((entry) => new WhereaboutsEntry(entry))));
    }

    getWhereaboutsFailures(athleteId: string): Observable<Array<WhereaboutsFailure>> {
        return this.http
            .get<Array<WhereaboutsFailure>>(`${this.endpoint}/${athleteId}/whereabouts-failures`)
            .pipe(map((failures) => failures.map((failure) => new WhereaboutsFailure(failure))));
    }

    /**
     * The endpoint for this one is still a POC -> ADAPI-3074, there is not enough definitions for a return, or params that should be sent
     */
    getTestingMetadata(athleteId: string): Observable<any> {
        return this.http.get<any>(`${this.endpoint}/${athleteId}/testing-meta-data`);
    }

    /**
     * The endpoint for this one is still a POC -> ADAPI-3094, there is not enough definitions for a return, or params that should be sent
     */
    getAthleteTUEs(athleteId: string): Observable<any> {
        return this.http.get<any>(`${this.endpoint}/${athleteId}/tues`);
    }

    /**
     * The endpoint for this one is still a POC -> ADAPI-3308, there is not enough definitions for a return, or params that should be sent
     */
    getAthleteAdrvs(athleteId: string): Observable<any> {
        return this.http.get<any>(`${this.endpoint}/${athleteId}/adrvs`);
    }

    /**
     * The endpoint for this one is still a POC -> ADAPI-3309, there is not enough definitions for a return, or params that should be sent
     */
    getAthleteSanctions(athleteId: string): Observable<any> {
        return this.http.get<any>(`${this.endpoint}/${athleteId}/sanctions`);
    }

    /**
     * Get Testing Orders (TOs)
     */
    getTestingOrders(athleteId: string): Observable<Array<TOItem>> {
        const params = new HttpParams().set('athleteId', athleteId);
        return this.http
            .get<Array<TOItem>>(`${this.endpoint}/testing-orders`, { params })
            .pipe(map((testingOrders) => testingOrders.map((testingOrder) => new TOItem(testingOrder))));
    }
}
