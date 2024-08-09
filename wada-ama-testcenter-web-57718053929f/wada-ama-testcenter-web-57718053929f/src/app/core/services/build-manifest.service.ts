/* eslint-disable camelcase */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BuildManifest } from '@core/models/build-manifest.model';

@Injectable()
export class BuildManifestService {
    constructor(private http: HttpClient) {}

    getBuildManifest(): Observable<BuildManifest> {
        const host = window.location.origin;
        const app = window.location.pathname.split('/')[1];
        const language = window.location.pathname.split('/')[2];
        const filename = 'build-manifest.json';
        const url = `${host}/${app}/${language}/${filename}`;
        return this.http.get<BuildManifest>(url);
    }
}
