import { ActionReducer } from '@ngrx/store';
import { environment } from '@env';

export function logger(reducer: ActionReducer<any>): any {
    return function newReducer(state: any, action: any): any {
        const nextState = reducer(state, action);
        if (!environment.production) {
            const payload = action.payload || {};
            console.groupCollapsed('%c action', 'color: #03A9F4; font-weight: bold', action.type, payload);
            console.log('%c prev state', 'color: #9E9E9E; font-weight: bold', state);
            console.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState);
            console.groupEnd();
        }
        return nextState;
    };
}
