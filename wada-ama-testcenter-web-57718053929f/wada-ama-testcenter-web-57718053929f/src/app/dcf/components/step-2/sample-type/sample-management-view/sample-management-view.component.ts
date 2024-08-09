import { Component, Input } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Sample } from '@sampleManagement/models';
import { Observable } from 'rxjs';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import * as fromSMStore from '@sampleManagement/store';
import { map } from 'rxjs/operators';
import { environment } from '@env';

@Component({
    selector: 'app-sample-management-view',
    templateUrl: './sample-management-view.component.html',
    styleUrls: ['./sample-management-view.component.scss'],
})
export class SampleManagementViewComponent {
    readonly sampleManagementLink = environment.sampleManagementLink;

    @Input() hasSampleManagementReader = false;

    @Input() sampleManagementSamplesInfo: Sample | null = null;

    dcfId$: Observable<string> = this.store.pipe(
        select(fromStore.getDCFId),
        map((id: number | null) => id?.toString() || '')
    );

    constructor(private store: Store<fromRootStore.IState>) {}

    openTestInSampleManagement(): void {
        this.dcfId$.subscribe((id) => window.open(`${this.sampleManagementLink}/dcfs/D-${id}`));
    }

    refreshSampleManagementRequest(): void {
        this.store.dispatch(fromSMStore.GetTestInformation());
    }
}
