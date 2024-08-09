import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store, select } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import * as OrganizationsActions from '@core/store/actions/organizations.actions';
import * as OrganizationSelectors from '@core/store/selectors/organizations.selectors';
import * as UserInfoActions from '@core/store/actions/user-info.actions';
import { Contract, Organization } from '@core/models';
import { CoreApiService } from '@core/services/core-api.service';

@Injectable()
export class OrganizationsEffects {
    getOrganizations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrganizationsActions.GetOrganizations),
            withLatestFrom(this.store.pipe(select(OrganizationSelectors.getOrganizations))),
            filter(
                ([, organizations]: [Action, Array<Organization> | null]) =>
                    !Array.isArray(organizations) || !organizations.length
            ),
            switchMap(() => this.coreApi.getAllOrganizations()),
            map((organizations: Array<Organization>) =>
                OrganizationsActions.GetOrganizationsSuccess({
                    organizations,
                })
            ),
            catchError(() => of(OrganizationsActions.GetOrganizationsError()))
        )
    );

    getSelectedContract$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrganizationsActions.GetSelectedContract),
            mergeMap(() => this.coreApi.getUserContracts(true)),
            map((selectedContracts) => this.getSelectedContractId(selectedContracts)),
            map((selectedContractId) =>
                OrganizationsActions.GetSelectedContractSuccess({
                    selectedContract: selectedContractId,
                })
            ),
            catchError(() => of(OrganizationsActions.GetSelectedContractError()))
        )
    );

    getSelectedContractSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrganizationsActions.GetSelectedContractSuccess),
            distinctUntilChanged(),
            map(() => UserInfoActions.GetUserInfo())
        )
    );

    getSelectedContractError$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrganizationsActions.GetSelectedContractError),
            distinctUntilChanged(),
            map(() => UserInfoActions.GetUserInfo())
        )
    );

    constructor(
        private coreApi: CoreApiService,
        private actions$: Actions,
        private store: Store<fromRootStore.IState>
    ) {}

    getSelectedContractId(selectedContracts: Array<Contract>): string | undefined {
        return selectedContracts[0]?.organizationId || undefined;
    }
}
