import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { environment } from '@env';
import { UserRolesEnum } from '@shared/models';
import * as fromStore from '@core/store';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    sidebarExpanded$: Observable<boolean>;

    menuExpanded$: Observable<boolean>;

    adamsUrl = environment.adamsUrl;

    currentYear = new Date().getFullYear().toString();

    isTDPReader$: Observable<boolean> = combineLatest([
        this.store.pipe(select(fromStore.getHasRole(UserRolesEnum.TDP_READER))),
        this.store.pipe(select(fromStore.getHasRole(UserRolesEnum.TDP_WRITER))),
    ]).pipe(map(([hasTDPReader, hasTDPWriter]: [boolean, boolean]) => hasTDPReader || hasTDPWriter));

    isMissionOrderReader$: Observable<boolean> = combineLatest([
        this.store.pipe(select(fromStore.getHasRole(UserRolesEnum.MISSION_ORDER_READER))),
        this.store.pipe(select(fromStore.getHasRole(UserRolesEnum.MISSION_ORDER_WRITER))),
        this.store.pipe(select(fromStore.getHasRole(UserRolesEnum.DCO_RIGHT))),
    ]).pipe(
        map(
            ([hasMissionOrderReader, hasMissionOrderWriter, hasDCORight]: [boolean, boolean, boolean]) =>
                hasMissionOrderReader || hasMissionOrderWriter || hasDCORight
        )
    );

    constructor(private store: Store<fromStore.IState>) {
        this.sidebarExpanded$ = this.store.select(fromStore.getSidebarExpanded);
        this.menuExpanded$ = this.store.select(fromStore.getMenuExpanded);
    }

    toggleSidebar(): void {
        this.store.dispatch(fromStore.ToggleSidebar());
    }

    toggleMenu(): void {
        this.store.dispatch(fromStore.ToggleMenu());
    }

    logoutAndNavigateToAdams(event: Event): void {
        this.store.dispatch(
            fromStore.Go({
                path: ['/external-redirect', { externalUrl: this.adamsUrl }],
                extras: { skipLocationChange: true },
            })
        );
        event.preventDefault();
    }
}
