import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Timezone, TimezoneField } from '@dcf/models';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromRootStore from '@core/store';

@Component({
    selector: 'app-set-timezone-default-modal',
    templateUrl: './timezone-default-modal.component.html',
    styleUrls: ['./timezone-default-modal.component.scss'],
})
export class SetTimezoneDefaultModalComponent {
    @Output()
    readonly overwriteTimezonesEmitter: EventEmitter<Timezone> = new EventEmitter<Timezone>();

    @Input() filledTimezones: Array<TimezoneField> | null = null;

    @Input() isModalClosable = true;

    route$: Observable<fromRootStore.RouterStateUrl | null> = this.store.pipe(select(fromRootStore.getActiveRoute));

    showModal = false;

    timezone: Timezone | undefined;

    constructor(private store: Store<fromRootStore.IState>) {}

    onCloseModal(): void {
        this.setShowModal(false);
    }

    onConfirm(): void {
        this.overwriteTimezonesEmitter.emit(this.timezone);
        this.setShowModal(false);
    }

    setShowModal(showModal: boolean): void {
        this.showModal = showModal;
    }

    show(timezone: Timezone): void {
        this.showModal = true;
        this.timezone = timezone;
    }
}
