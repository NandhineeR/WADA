import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { map } from 'rxjs/operators';
import { StatusEnum } from '@shared/models';

type RouterStateUrl = fromRootStore.RouterStateUrl;

@Component({
    selector: 'app-add-placeholder',
    templateUrl: './add-placeholder.component.html',
    styleUrls: ['./add-placeholder.component.scss'],
})
export class AddPlaceholderComponent {
    isTOIssued$: Observable<boolean> = this.store.pipe(
        select(fromStore.getTOStatus),
        map((status) => status === StatusEnum.Issued)
    );

    route$: Observable<RouterStateUrl | null> = this.store.pipe(select(fromRootStore.getActiveRoute));

    urlWithoutParenthesis$: Observable<string> = this.store.pipe(
        select(fromRootStore.getActiveRouteUrlWithoutParenthesis())
    );

    constructor(private store: Store<fromRootStore.IState>) {}
}
