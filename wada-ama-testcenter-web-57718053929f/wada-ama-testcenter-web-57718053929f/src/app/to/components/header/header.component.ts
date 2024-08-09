import { SpecificCode, StatusEnum } from '@shared/models';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Test, Warning } from '@to/models';
import { isNullOrBlank } from '@shared/utils';
import { find } from 'lodash-es';

interface StatusClass {
    [key: string]: boolean;
}

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Input() set isToInCreation(isToInCreation: boolean) {
        this._isTOInCreation = isToInCreation;
        this.updateIsCancellable();
    }

    @Input() set canUserCancel(canUserCancel: boolean) {
        this._canUserCancel = canUserCancel;
        this.updateIsCancellable();
    }

    @Input() set canUserComplete(canUserComplete: boolean) {
        this._canUserComplete = canUserComplete;
        this.updateIsCompletable();
    }

    @Output()
    readonly cancelEmitter: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    readonly completeEmitter: EventEmitter<void> = new EventEmitter();

    @Input() set testsWithDCF(testsWithDCF: Array<Test>) {
        this.testsWithDCFWarning.names = [];
        if (testsWithDCF.length > 0) {
            testsWithDCF.forEach((test) => {
                this.addToTestsWithDCFWarning(test);
            });
        }
    }

    hasDCFComplete = false;

    isCancellable = false;

    isCompletable = false;

    private addToTestsWithDCFWarning(test: Test) {
        if (test.dcfStatus && test.dcfStatus.specificCode === SpecificCode.Complete) {
            this.hasDCFComplete = true;
        } else {
            let name = '';
            //  placeholder who's not binded to an athlete
            if (test.athlete === null && test.isPlaceholder) {
                name = test.placeHolderDescription;
            } else if (test.athlete && !test.isPlaceholder) {
                name = HeaderComponent.getNameFromTest(test);
            } else if (test.athlete === null && test.isPlaceholder && !isNullOrBlank(test.placeHolderDescription)) {
                name = `${HeaderComponent.getNameFromTest(test)} - ${test.placeHolderDescription}`;
            }
            if (find(this.testsWithDCFWarning.names, name) === undefined) {
                this.testsWithDCFWarning.names.push(name);
            }
        }
    }

    @Input() set status(status: StatusEnum) {
        this._status = status;
        this.statusClass = getStatusClass(status);
        this.statusString = StatusEnum[status];
        this.updateIsCancellable();
        this.updateIsCompletable();
    }

    _canUserCancel = false;

    _canUserComplete = false;

    _isTOInCreation = false;

    _status = StatusEnum.Draft;

    statusClass = getStatusClass(this._status);

    statusString = StatusEnum[this._status];

    testsWithDCFWarning = new Warning();

    cancelTO(reason: string): void {
        this.cancelEmitter.emit(reason);
    }

    completeTO(): void {
        this.completeEmitter.emit();
    }

    static getNameFromTest(test: Test): string {
        let name =
            test.athlete && !isNullOrBlank(test.athlete.firstName)
                ? `${test.athlete.lastName}, ${test.athlete.firstName}`
                : '';
        if (name === ', ') {
            name = '';
        }
        return name;
    }

    updateIsCancellable(): void {
        this.isCancellable = this._status !== StatusEnum.Cancelled && !this._isTOInCreation && this._canUserCancel;
    }

    updateIsCompletable(): void {
        this.isCompletable =
            this._status !== StatusEnum.Cancelled &&
            this._status !== StatusEnum.Completed &&
            !this._isTOInCreation &&
            this._canUserComplete;
    }
}

function getStatusClass(status: StatusEnum): StatusClass {
    return {
        'inner-status': true,
        draft: status === StatusEnum.Draft || status === StatusEnum.InCreation,
        issued: status === StatusEnum.Issued,
        completed: status === StatusEnum.Completed,
        cancelled: status === StatusEnum.Cancelled,
    };
}
