export interface ILayoutState {
    sidebarExpanded: boolean;
    menuExpanded: boolean;
}

export const initialLayoutState: ILayoutState = {
    sidebarExpanded: false,
    menuExpanded: true,
};
