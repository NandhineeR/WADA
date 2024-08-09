import { Component, EventEmitter, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUser } from '@core/models';
import * as fromStore from '@core/store';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Output() readonly toggleSidebar: EventEmitter<any> = new EventEmitter();

    user$: Observable<string> = this.store.pipe(
        select(fromStore.getUserProfile),
        map(HeaderComponent.getFormattedName)
    );

    realOrganization$ = this.store.pipe(select(fromStore.getOrganization));

    sourceOrganization$ = this.store.pipe(select(fromStore.getSourceOrganization));

    constructor(private store: Store<fromStore.IState>, private router: Router) {}

    onClickToggleSidebar(): void {
        this.toggleSidebar.emit();
    }

    private static getFormattedName(user: IUser): string {
        const { firstName, lastName, username } = user;
        const personName = HeaderComponent.getFormattedPersonName(firstName, lastName);

        if (personName && username) {
            return `${personName} (${username})`;
        }

        return personName || username;
    }

    private static getFormattedPersonName(firstName: string | undefined, lastName: string | undefined) {
        if (firstName && lastName) {
            return `${lastName}, ${firstName}`;
        }

        if (firstName) {
            return `${firstName}`;
        }

        if (lastName) {
            return `${lastName}`;
        }

        return '';
    }

    navigate(link: string): void {
        window.location.reload();
        // delay to fix duplicate redirection when user is unauthorized
        setTimeout(() => {
            this.router.navigate([link]);
        }, 100);
    }
}
