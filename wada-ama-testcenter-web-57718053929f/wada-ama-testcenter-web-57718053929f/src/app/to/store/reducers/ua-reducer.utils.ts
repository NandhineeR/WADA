import { FieldsSecurity, SecurityWrapper } from '@shared/models';
import { UA } from '@to/models';
import { IViewUAState } from '../states/ua.state';

/**
 * Building the new state after a GetUAsSuccess action is dispatched
 * @param state: IViewUAState
 * @param securityWrappers:  Array<SecurityWrapper<UA>>
 */
export function mapUAs(state: IViewUAState, securityWrappers: Array<SecurityWrapper<UA>>): IViewUAState {
    let toId = '';
    let scaId = null;
    const fieldsSecurity = new Map<string, FieldsSecurity>();

    if (securityWrappers && securityWrappers.length > 0) {
        toId = securityWrappers[0].data.test?.toId || '';
        scaId = securityWrappers[0].data.test?.sampleCollectionAuthority?.id || null;

        securityWrappers.forEach((securityWrapper: SecurityWrapper<UA>) => {
            const securityId = securityWrapper.data.id?.toString() || '';
            const fieldsSecurityByUAId = new FieldsSecurity({
                actions: securityWrapper.actions,
                fields: securityWrapper.fields,
            });

            fieldsSecurity.set(securityId, fieldsSecurityByUAId);
        });
    }

    return {
        ...state,
        uas: securityWrappers.map((securityWrapper: SecurityWrapper<UA>) => securityWrapper.data),
        toId,
        scaId,
        loading: false,
        error: false,
        fieldsSecurity,
    };
}
