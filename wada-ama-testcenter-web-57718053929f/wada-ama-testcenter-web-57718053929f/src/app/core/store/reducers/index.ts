import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { IFeatureState } from '@core/store/feature-state';
import { RouterStateUrl } from '@core/store/states/router.state';
import { ILayoutState } from '@core/store/states/layout.state';
import { IOrganizationsState } from '@core/store/states/organizations.state';
import { IUserInfoState } from '@core/store/states/user-info.state';
import { ISportNationalitiesState } from '@core/store/states/sport-nationalities.state';
import { ISportDisciplinesState } from '@core/store/states/sport-disciplines.state';
import * as fromLayout from './layout.reducer';
import * as fromUserInfo from './user-info.reducer';
import * as fromEnterprise from './enterprise.reducer';
import * as fromSportNationalities from './sport-nationalities.reducers';
import * as fromSportDisciplines from './sport-disciplines.reducer';
import * as fromOrganizations from './organizations.reducer';
import * as fromRouter from './router.reducer';
import { IEnterpriseState } from '../states/enterprise.state';

export interface IState extends IFeatureState {
    router: RouterReducerState<RouterStateUrl>;
    activeRoute: RouterStateUrl;
    layout: ILayoutState;
    userInfo: IUserInfoState;
    enterprise: IEnterpriseState;
    sportNationalities: ISportNationalitiesState;
    sportDisciplines: ISportDisciplinesState;
    organizations: IOrganizationsState;
}

export const reducers: ActionReducerMap<IState> = {
    router: routerReducer,
    activeRoute: fromRouter.reducer as ActionReducer<RouterStateUrl>,
    layout: fromLayout.reducer as ActionReducer<ILayoutState>,
    userInfo: fromUserInfo.reducer as ActionReducer<IUserInfoState>,
    enterprise: fromEnterprise.reducer as ActionReducer<IEnterpriseState>,
    sportNationalities: fromSportNationalities.reducer as ActionReducer<ISportNationalitiesState>,
    sportDisciplines: fromSportDisciplines.reducer as ActionReducer<ISportDisciplinesState>,
    organizations: fromOrganizations.reducer as ActionReducer<IOrganizationsState>,
};

export * from '@core/serializers/router.serializer';
