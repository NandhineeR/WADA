import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { TranslationService } from '@core/services';
import { ConcurrentUser } from '@tdp/models';

type Moment = moment.Moment;

@Component({
    selector: 'app-concurrent-user',
    templateUrl: './concurrent-user.component.html',
    styleUrls: ['./concurrent-user.component.scss'],
})
export class ConcurrentUserComponent implements OnChanges {
    @Input() organization = '';

    @Input() users = new ConcurrentUser();

    @Input() currentUser = '';

    day = 0;

    month = 0;

    year = 0;

    gmtDate: Moment | null = null;

    translations$ = this.translationService.translations$;

    constructor(private translationService: TranslationService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.users && changes.users.currentValue && changes.users.currentValue.lastUpdate !== undefined) {
            this.gmtDate = moment(this.users.lastUpdate).add(-moment().utcOffset(), 'm').utcOffset(0);
            this.day = new Date(this.users.lastUpdate).getDate();
            this.month = new Date(this.users.lastUpdate).getMonth();
            this.year = new Date(this.users.lastUpdate).getFullYear();
        }
    }
}
