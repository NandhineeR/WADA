import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import { ORGANIZATION_ID_PLACEHOLDER } from '@core/http-interceptors/organization-id.interceptor';
import {
    Contract,
    IOrganization,
    ISportDisciplineDescription,
    IUserSettings,
    Organization,
    SportDisciplineDescription,
} from '@core/models';
import { Country } from '@shared/models';

@Injectable()
export class CoreApiService {
    private clientApiBaseUrl: string = environment.clientApiBaseUrl;

    constructor(private http: HttpClient) {}

    getAllOrganizations(): Observable<Array<Organization>> {
        return this.http
            .get<Array<Organization>>(`${this.clientApiBaseUrl}/user/organizations`)
            .pipe(
                map((organizations: Array<IOrganization>) =>
                    organizations.map((organization: IOrganization) => new Organization(organization))
                )
            );
    }

    getAllSportNationalities(): Observable<Array<Country>> {
        return this.http.get<Array<Country>>(`${this.clientApiBaseUrl}/country/localizedCountries/`);
    }

    getAllDisciplines(year: number): Observable<Array<SportDisciplineDescription>> {
        const params = new HttpParams().set('orgId', ORGANIZATION_ID_PLACEHOLDER).set('year', year.toString());

        return this.http
            .get<Array<ISportDisciplineDescription>>(`${this.clientApiBaseUrl}/tdp/disciplines`, { params })
            .pipe(
                map((sportDisciplines: Array<ISportDisciplineDescription>) =>
                    sportDisciplines.map(
                        (discipline: ISportDisciplineDescription) => new SportDisciplineDescription(discipline)
                    )
                )
            );
    }

    getUserContracts(getOnlySelected: boolean): Observable<Array<Contract>> {
        const pathParam = `?selected=${getOnlySelected}`;
        return this.http.get<Array<Contract>>(`${this.clientApiBaseUrl}/me/user/contracts${pathParam}`);
    }

    getUserInfo(): Observable<IUserSettings> {
        return this.http.get<IUserSettings>(`${this.clientApiBaseUrl}/me/user/info`);
    }
}
