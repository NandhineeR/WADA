import { Component, Input } from '@angular/core';
import { SportIdentity } from '@athlete/models/sport-identity.model';
import { Athlete } from '@shared/models';

@Component({
    selector: 'app-dashboard-header',
    templateUrl: './dashboard-header.component.html',
    styleUrls: ['./dashboard-header.component.scss'],
})
export class DashboardHeaderComponent {
    @Input() athlete: Athlete | null = null;

    @Input() sportIdentities: Array<SportIdentity> = [];
}
