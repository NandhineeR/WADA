import { createSelector } from '@ngrx/store';

import * as fromRoot from '@core/store/reducers';
import { ILayoutState } from '@core/store/states/layout.state';

export const getLayoutState = (state: fromRoot.IState) => state.layout;

export const getSidebarExpanded = createSelector(getLayoutState, (layout: ILayoutState) => layout.sidebarExpanded);

export const getMenuExpanded = createSelector(getLayoutState, (layout: ILayoutState) => layout.menuExpanded);
