import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Athlete, StatusEnum } from '@shared/models';

interface StatusClass {
    [key: string]: boolean;
}

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Output()
    readonly cancelDcf: EventEmitter<string> = new EventEmitter<string>();

    @Input() athlete: Athlete = new Athlete();

    @Input() isCancellable = false;

    @Input() isDCFMode = true;

    @Input() isUserAnonymous = false;

    @Input() matchType = '';

    @Input() set removeDecoration(remove: boolean) {
        this.statusClass = remove ? this.getStatusClass(null) : this.getStatusClass(this._status);
    }

    @Input() set status(status: StatusEnum | null) {
        this._status = status;
        this.statusClass = this.getStatusClass(status);
        if (status != null) {
            this.statusString = StatusEnum[status];
        }
    }

    get status(): StatusEnum | null {
        return this._status || null;
    }

    statusClass = this.getStatusClass(this.status);

    statusString: string | null = null;

    private _status: StatusEnum | null = null;

    changeStatusToCancel(reason: string): void {
        this.cancelDcf.emit(reason);
    }

    private getStatusClass(status: StatusEnum | null): StatusClass {
        return status !== null
            ? {
                  'inner-status': true,
                  draft: status === StatusEnum.Draft,
                  completed: status === StatusEnum.Completed,
                  cancelled: status === StatusEnum.Cancelled,
              }
            : {
                  'inner-status': true,
                  default: true,
              };
    }
}
