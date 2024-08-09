import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    Blood,
    BloodPassport,
    BloodPassportUtils,
    BloodUtils,
    DCFForm,
    DCFFormUtils,
    ProceduralInformation,
    Sample,
    Urine,
    UrineUtils,
    DriedBloodSpot,
    DriedBloodSpotUtils,
    UrineSampleBoundaries,
    SampleUtils,
} from '@dcf/models';
import { DCFActionRight, FieldsSecurity } from '@shared/models';
import { Observable } from 'rxjs';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';

@Component({
    selector: 'app-dcf-view-section',
    templateUrl: './dcf-view-section.component.html',
})
export class DCFViewSectionComponent {
    readonly actionRight = DCFActionRight;

    readonly requiredfields = DCFFormUtils.requiredFields;

    @Output() readonly errorCount = new EventEmitter<number>();

    @Input() set dcf(data: DCFForm | null) {
        this._dcf = data;
        this.extractSamplesByType(data?.samples || new Array<Sample>());
        this.dcfProceduralInformation = this.buildProceduralInformation(data);
        this.checkErrors();
    }

    get dcf(): DCFForm | null {
        return this._dcf;
    }

    @Input() errors = new Set<string>();

    @Input() fieldsSecurity = new FieldsSecurity();

    @Input() locale = '';

    @Input() showErrors = false;

    @Input() status = '';

    @Input() urineSampleBoundaries: UrineSampleBoundaries | null = null;

    bloodPassportSamples: Array<BloodPassport> = [];

    bloodSamples: Array<Blood> = [];

    dcfProceduralInformation: ProceduralInformation | null = null;

    driedBloodSpotSamples: Array<DriedBloodSpot> = [];

    isSampleTimezoneRequired$: Observable<boolean> = this.store.select(fromRootStore.isSampleTimezoneRequired);

    missingFields = new Set<string>();

    missingSampleFields = new Map<string, Set<string>>();

    urineSamples: Array<Urine> = [];

    private _dcf: DCFForm | null = null;

    constructor(public store: Store<fromRootStore.IState>) {}

    buildProceduralInformation(dcf: DCFForm | null): ProceduralInformation | null {
        if (!dcf) return null;

        const proceduralInfo = new ProceduralInformation();
        proceduralInfo.endOfProcedureDate = dcf.endOfProcedureDate;
        proceduralInfo.consentForResearch = dcf.consentForResearch;
        proceduralInfo.declarationOfSupplements = dcf.declarationOfSupplements;
        proceduralInfo.dco = dcf.dco;

        return proceduralInfo;
    }

    getSampleIndex(sample: Sample, i: number): number {
        const urineSamplesLength: number = this.urineSamples?.length || 0;
        const bloodSamplesLength: number = this.bloodSamples?.length || 0;
        const bloodPassportSamplesLength: number = this.bloodPassportSamples?.length || 0;

        let index = 0;
        if (SampleFactory.isUrine(sample)) {
            index = i + 1;
        } else if (SampleFactory.isBlood(sample)) {
            index = i + 1 + urineSamplesLength;
        } else if (SampleFactory.isBloodPassport(sample)) {
            index = i + 1 + urineSamplesLength + bloodSamplesLength;
        } else if (SampleFactory.isDriedBloodSpot(sample)) {
            index = i + 1 + urineSamplesLength + bloodSamplesLength + bloodPassportSamplesLength;
        }
        return index;
    }

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingSampleFields.clear();

        this.urineSamples.forEach((s) => this.missingSampleFields.set(`${s.id}`, UrineUtils.missingFields(s, true)));
        this.bloodSamples.forEach((s) => this.missingSampleFields.set(`${s.id}`, BloodUtils.missingFields(s, true)));
        this.bloodPassportSamples.forEach((s) =>
            this.missingSampleFields.set(`${s.id}`, BloodPassportUtils.missingFields(s, true))
        );
        this.driedBloodSpotSamples.forEach((s) =>
            this.missingSampleFields.set(`${s.id}`, DriedBloodSpotUtils.missingFields(s, true))
        );

        this.isSampleTimezoneRequired$.subscribe((sampleTimezoneRequired: boolean) => {
            if (!sampleTimezoneRequired) {
                this.missingSampleFields.forEach((sample) => sample.delete(SampleUtils.requiredFields.Timezone));
            }
        });

        setTimeout(() => this.errorCount.emit(this.missingFieldsCount));
    }

    private extractSamplesByType(sample: Array<Sample>): void {
        const samples = sample || [];
        this.urineSamples = SampleFactory.getUrineSamples(samples);
        this.bloodSamples = SampleFactory.getBloodSamples(samples);
        this.bloodPassportSamples = SampleFactory.getBloodPassportSamples(samples);
        this.driedBloodSpotSamples = SampleFactory.getDriedBloodSpotSamples(samples);
    }

    get missingFieldsCount(): number {
        return (
            Array.from(this.missingSampleFields.values()).reduce((sum, fields) => sum + fields.size, 0) +
            this.missingFields.size
        );
    }
}
