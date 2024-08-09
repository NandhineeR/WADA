import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@env';
import {
    CountryWithRegions,
    Laboratory,
    ListItem,
    LocalizedEntity,
    MajorEvent,
    Participant,
    ParticipantType,
    SampleType,
    SportDiscipline,
    Status,
} from '@shared/models';
import { OrganizationRelationship } from '@to/models';
import { Timezone, UrineSampleBoundaries } from '@dcf/models';
import {
    ListMajorEventAutoCompletes,
    ListParticipantAutoCompletes,
    ListUrineSampleBoundaries,
} from '@autocompletes/models';
import { buildParticipantMap } from '@autocompletes/utils';

@Injectable()
export class AutoCompletesService {
    private baseUrl = `${environment.clientApiBaseUrl}/auto-completes`;

    constructor(private http: HttpClient) {}

    getAdos(): Observable<Array<ListItem>> {
        return this.http
            .get(`${this.baseUrl}/ados`)
            .pipe(map((ados: any) => (ados || []).map((o: any) => new ListItem(o))));
    }

    getAthleteRepresentatives(athleteId: string, scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId || '').set('athleteId', athleteId || '');
        return this.http
            .get(`${this.baseUrl}/athlete-representatives`, {
                params,
            })
            .pipe(
                map(
                    (athleteRepresentatives: any) =>
                        new ListParticipantAutoCompletes({
                            athleteId,
                            scaId,
                            participants: (athleteRepresentatives || []).map((p: any) => new Participant(p)),
                        })
                )
            );
    }

    getBloodOfficials(scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId || '');
        return this.http
            .get(`${this.baseUrl}/blood-officials`, {
                params,
            })
            .pipe(
                map(
                    (bloodOfficials: any) =>
                        new ListParticipantAutoCompletes({
                            scaId,
                            participants: (bloodOfficials || []).map((p: any) => new Participant(p)),
                        })
                )
            );
    }

    getCoachMap(athleteIds: Array<number>, scaId: string): Observable<Map<string, Array<Participant>>> {
        const params = new HttpParams()
            .set('organizationId', scaId || '')
            .set('athleteIds', athleteIds.map((id: number) => id.toString()).join());
        return this.http
            .get(`${this.baseUrl}/coach-map`, {
                params,
            })
            .pipe(map((coaches: any) => buildParticipantMap(coaches)));
    }

    getCoaches(athleteId: string, scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId || '').set('athleteId', athleteId || '');
        return this.http
            .get(`${this.baseUrl}/coaches`, {
                params,
            })
            .pipe(
                map(
                    (coaches: any) =>
                        new ListParticipantAutoCompletes({
                            athleteId,
                            scaId,
                            participants: (coaches || []).map((p: any) => new Participant(p)),
                        })
                )
            );
    }

    getCompetitionCategories(): Observable<Array<ListItem>> {
        return this.http
            .get(`${this.baseUrl}/competition-categories`, {})
            .pipe(map((categories: any) => categories.map((c: any) => new ListItem(c))));
    }

    getCountriesWithRegions(): Observable<Array<CountryWithRegions>> {
        return this.http
            .get(`${this.baseUrl}/countries`)
            .pipe(
                map((countriesWithRegions: any) =>
                    (countriesWithRegions || []).map((c: any) => new CountryWithRegions(c))
                )
            );
    }

    getDcos(scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId || '');
        return this.http
            .get(`${this.baseUrl}/dcos`, {
                params,
            })
            .pipe(
                map(
                    (dcos: any) =>
                        new ListParticipantAutoCompletes({
                            scaId,
                            participants: (dcos || []).map((p: any) => new Participant(p)),
                        })
                )
            );
    }

    getDoctorMap(athleteIds: Array<number>, scaId: string): Observable<Map<string, Array<Participant>>> {
        const params = new HttpParams()
            .set('organizationId', scaId || '')
            .set('athleteIds', athleteIds.map((id: number) => id.toString()).join());
        return this.http
            .get(`${this.baseUrl}/doctor-map`, {
                params,
            })
            .pipe(map((doctors: any) => buildParticipantMap(doctors)));
    }

    getDoctors(athleteId: string, scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId || '').set('athleteId', athleteId || '');
        return this.http
            .get(`${this.baseUrl}/doctors`, {
                params,
            })
            .pipe(
                map(
                    (doctors: any) =>
                        new ListParticipantAutoCompletes({
                            athleteId,
                            scaId,
                            participants: (doctors || []).map((p: any) => new Participant(p)),
                        })
                )
            );
    }

    getDtps(): Observable<Array<ListItem>> {
        return this.http
            .get(`${this.baseUrl}/dtps`)
            .pipe(map((dtps: any) => (dtps || []).map((o: any) => new ListItem(o))));
    }

    getIdentificationDocuments(): Observable<Array<ListItem>> {
        return this.http
            .get(`${this.baseUrl}/identification-documents`)
            .pipe(
                map((identificationDocuments: any) => (identificationDocuments || []).map((i: any) => new ListItem(i)))
            );
    }

    getLaboratories(): Observable<Array<Laboratory>> {
        return this.http
            .get(`${this.baseUrl}/laboratories`)
            .pipe(map((laboratories: any) => (laboratories || []).map((l: any) => new Laboratory(l))));
    }

    getMajorEvents(numberPriorMonths: string): Observable<ListMajorEventAutoCompletes> {
        const params = new HttpParams().set('numberPriorMonths', numberPriorMonths);
        return this.http.get(`${this.baseUrl}/major-events`, { params }).pipe(
            map(
                (majorEvents: any) =>
                    new ListMajorEventAutoCompletes({
                        numberPriorMonths,
                        majorEvents: (majorEvents || []).map((p: any) => new MajorEvent(p)),
                    })
            )
        );
    }

    getManufacturers(): Observable<Array<LocalizedEntity>> {
        return this.http
            .get(`${this.baseUrl}/manufacturers`)
            .pipe(map((manufacturers: any) => (manufacturers || []).map((m: any) => new LocalizedEntity(m))));
    }

    getMOParticipants(scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId);
        return this.http.get(`${this.baseUrl}/mo-participants`, { params }).pipe(
            map(
                (moParticipants: any) =>
                    new ListParticipantAutoCompletes({
                        scaId,
                        participants: (moParticipants || []).map((p: any) => new Participant(p)),
                    })
            )
        );
    }

    getNonConformityCategories(): Observable<Array<ListItem>> {
        return this.http
            .get(`${this.baseUrl}/non-conformity-categories`)
            .pipe(
                map((nonConformityCategories: any) => (nonConformityCategories || []).map((c: any) => new ListItem(c)))
            );
    }

    getNotifyingChaperones(scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId || '');
        return this.http
            .get(`${this.baseUrl}/notifying-chaperones`, {
                params,
            })
            .pipe(
                map(
                    (notifyingChaperones: any) =>
                        new ListParticipantAutoCompletes({
                            scaId,
                            participants: (notifyingChaperones || []).map((p: any) => new Participant(p)),
                        })
                )
            );
    }

    getOrganizationRelationships(): Observable<Array<OrganizationRelationship>> {
        return this.http
            .get(`${this.baseUrl}/organization-relationships`)
            .pipe(
                map((organizationRelationships: any) =>
                    (organizationRelationships || []).map((o: any) => new OrganizationRelationship(o))
                )
            );
    }

    getParticipantStatuses(): Observable<Array<Status>> {
        return this.http
            .get(`${this.baseUrl}/participant-statuses`)
            .pipe(map((participantStatuses: any) => participantStatuses.map((s: any) => new Status(s))));
    }

    getParticipantTypes(): Observable<Array<ParticipantType>> {
        return this.http
            .get(`${this.baseUrl}/participant-types`)
            .pipe(map((participantTypes: any) => participantTypes.map((t: any) => new ParticipantType(t))));
    }

    getSampleTypes(): Observable<Array<SampleType>> {
        return this.http
            .get(`${this.baseUrl}/sample-types`)
            .pipe(map((sampleTypes: any) => (sampleTypes || []).map((s: any) => new SampleType(s))));
    }

    getSelectionCriteria(): Observable<Array<ListItem>> {
        return this.http
            .get(`${this.baseUrl}/selection-criteria`)
            .pipe(map((selectionCriteria: any) => (selectionCriteria || []).map((c: any) => new ListItem(c))));
    }

    getSportDisciplines(): Observable<Array<SportDiscipline>> {
        return this.http
            .get(`${this.baseUrl}/sport-disciplines`)
            .pipe(map((sportDisciplines: any) => (sportDisciplines || []).map((s: any) => new SportDiscipline(s))));
    }

    getTimezones(): Observable<Array<Timezone>> {
        return this.http
            .get(`${this.baseUrl}/timezones`)
            .pipe(map((timezones: any) => (timezones || []).map((t: any) => new Timezone(t))));
    }

    getUrineBoundaries(): Observable<ListUrineSampleBoundaries> {
        return this.http
            .get(`${this.baseUrl}/urineBoundaries`)
            .pipe(map((urineBoundaries: any) => (urineBoundaries || []).map((u: any) => new UrineSampleBoundaries(u))));
    }

    getWitnessChaperones(scaId: string): Observable<ListParticipantAutoCompletes> {
        const params = new HttpParams().set('organizationId', scaId || '');
        return this.http
            .get(`${this.baseUrl}/witness-chaperones`, {
                params,
            })
            .pipe(
                map(
                    (witnessChaperones: any) =>
                        new ListParticipantAutoCompletes({
                            scaId,
                            participants: (witnessChaperones || []).map((p: any) => new Participant(p)),
                        })
                )
            );
    }
}
