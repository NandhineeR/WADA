import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProceduralInformation, ProceduralInformationUtils } from '@dcf/models';
import { DCFActionRight } from '@shared/models';

@Component({
    selector: 'app-procedural-information',
    templateUrl: './procedural-information.component.html',
    styleUrls: ['./procedural-information.component.scss'],
})
export class ProceduralInformationComponent {
    readonly actionRight = DCFActionRight;

    readonly fields = ProceduralInformationUtils.requiredFields;

    @Output()
    readonly showProceduralInformationErrors = new EventEmitter<boolean>(false);

    @Input() set proceduralInformation(info: ProceduralInformation | null) {
        this._proceduralInformation = info;
        if (info) this.checkErrors();
    }

    get proceduralInformation(): ProceduralInformation | null {
        return this._proceduralInformation;
    }

    @Input() actions: Array<string> = new Array<string>();

    @Input() dcfId = '';

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    @Input() isCancelled = false;

    missingFields = new Set<string>();

    private _proceduralInformation: ProceduralInformation | null = null;

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingFields = ProceduralInformationUtils.missingFields(this.proceduralInformation);
        if (this.missingFields.size > 0) {
            this.showProceduralInformationErrors.emit(true);
        } else {
            this.showProceduralInformationErrors.emit(false);
        }
    }
}
