import { Action, createReducer, on } from '@ngrx/store';
import * as fromLayout from '@core/store/actions/layout.actions';
import { ILayoutState, initialLayoutState } from '@core/store/states/layout.state';

export const layoutReducer = createReducer(
    initialLayoutState,
    on(fromLayout.ExpandSidebar, (state) => ({
        ...state,
        sidebarExpanded: true,
    })),
    on(fromLayout.CollapseSidebar, (state) => ({
        ...state,
        sidebarExpanded: false,
    })),
    on(fromLayout.ToggleSidebar, (state) => ({
        ...state,
        sidebarExpanded: !state.sidebarExpanded,
    })),
    on(fromLayout.ExpandMenu, (state) => ({
        ...state,
        menuExpanded: true,
    })),
    on(fromLayout.CollapseMenu, (state) => ({
        ...state,
        menuExpanded: false,
    })),
    on(fromLayout.ToggleMenu, (state) => ({
        ...state,
        menuExpanded: !state.menuExpanded,
    }))
);

export function reducer(state: ILayoutState | undefined, action: Action): ILayoutState {
    return layoutReducer(state, action);
}
