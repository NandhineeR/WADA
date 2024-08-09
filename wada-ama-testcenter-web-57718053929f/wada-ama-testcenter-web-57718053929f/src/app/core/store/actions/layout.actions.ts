import { createAction } from '@ngrx/store';

export const ExpandSidebar = createAction('[LAYOUT] EXPAND SIDEBAR');

export const CollapseSidebar = createAction('[LAYOUT] COLLAPSE SIDEBAR');

export const ToggleSidebar = createAction('[LAYOUT] TOGGLE SIDEBAR');

export const ExpandMenu = createAction('[LAYOUT] EXPAND MENU');

export const CollapseMenu = createAction('[LAYOUT] COLLAPSE MENU');

export const ToggleMenu = createAction('[LAYOUT] TOGGLE MENU');
