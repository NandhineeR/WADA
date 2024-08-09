import { Action, ActionReducer } from '@ngrx/store';
import { IState } from '@core/store/reducers';
import { IFeatureState } from '@core/store/feature-state';

export function featureWatcher(reducer: ActionReducer<IState>): ActionReducer<IState> {
    return (state: IState | undefined, action: Action): IState => {
        const nextState: IState = reducer(state, action);
        return {
            ...nextState,
            loading: reduceFeatureProperty(nextState, 'loading', true),
            error: reduceFeatureProperty(nextState, 'error'),
        };
    };
}

/**
 * Checks if the state, or any sub states, contains a given key with the value "true"
 * @param state The state
 * @param property A boolean property of the state (e.g. loading)
 * @param defaultValueIfNonObject The default value if the state is not an object (i.e. the state is undefined)
 * @returns true if any feature state or any child of a feature state has featureState[property] == true
 */
function reduceFeatureProperty(state: any, property: keyof IFeatureState, defaultValueIfNonObject = false): boolean {
    if (typeof state !== 'object') {
        return defaultValueIfNonObject;
    }
    return Object.keys(state)
        .map((stateKey) => state[stateKey])
        .filter(Boolean)
        .some(
            (featureState: IFeatureState) =>
                (featureState[property] as boolean) || reduceFeatureProperty(featureState, property)
        );
}
