import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import { UserRolesEnum } from '@shared/models';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-whats-next',
    templateUrl: './whats-next.component.html',
    styleUrls: ['./whats-next.component.scss'],
})
export class WhatsNextComponent implements OnInit {
    isMissionOrderWriter$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getHasRole(UserRolesEnum.MISSION_ORDER_WRITER))
    );

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {}
}
