import { DCF, Sample } from '@dcf/models';
import { Conflict, ConflictException } from '@core/models';
import { SAMPLE_CODE_VALIDATION_WARNING } from '@shared/utils/exception-code';
import { IMultipleDCFState } from '@dcf/store/states/multiple-dcf.state';
import { FieldsSecurity, SecurityWrapper } from '@shared/models';

export function mapConflictException(exception: ConflictException | null): ConflictException | null {
    if (exception && exception.conflict && exception.conflict.conflictParameters) {
        const sampleType = exception.conflict.conflictParameters.get('sampleType');
        if (sampleType) {
            // ensure sample type matches the expected specific code
            const formattedValue =
                sampleType.charAt(0).toUpperCase() + sampleType.slice(1).split(' ').join('_').toLowerCase();
            exception.conflict.conflictParameters.set('sampleType', formattedValue);
        }
    }

    return exception;
}

/**
 * Building the new state after a MULTIPLE_DCF_GET_DCF_SUCCESS
 * @param state: IMultipleDCFState
 * @param securityWrappers:  Array<SecurityWrapper<DCF>>
 */
export function mapMultipleDCFState(
    state: IMultipleDCFState,
    securityWrappers: Array<SecurityWrapper<DCF>>
): IMultipleDCFState {
    let scaId = null;
    const fieldsSecurity = new Map<string, FieldsSecurity>();

    if (securityWrappers && securityWrappers.length > 0) {
        scaId = securityWrappers[0].data.authorization?.sampleCollectionAuthority?.id || null;

        securityWrappers.forEach((securityWrapper: SecurityWrapper<DCF>) => {
            const securityId = securityWrapper.data.id?.toString() || '';
            const fieldsSecurityByDcfId = new FieldsSecurity({
                actions: securityWrapper.actions,
                fields: securityWrapper.fields,
            });

            fieldsSecurity.set(securityId, fieldsSecurityByDcfId);
        });
    }

    return {
        ...state,
        loading: false,
        error: false,
        dcfs: securityWrappers.map((securityWrapper: SecurityWrapper<DCF>) => securityWrapper.data),
        scaId,
        fieldsSecurity,
    };
}

export function mapSampleWarningToException(
    samplesFromException: Array<Sample>,
    samples: Sample[] | undefined = []
): ConflictException | null {
    const samplesWithWarning: Array<Sample> = samplesFromException.filter((sample: Sample) => sample.warningDuplicate);
    let exception: ConflictException | null = null;
    if (samplesWithWarning.length >= 1) {
        exception = new ConflictException();
        exception.status = 409;
        exception.conflict = new Conflict();
        exception.conflict.code = SAMPLE_CODE_VALIDATION_WARNING;
        const newConflictParameters = new Map<string, string>();
        samplesWithWarning.forEach((sampleWithWarning) => {
            const index = samples.findIndex(
                (sample: Sample) =>
                    sample.sampleCode === sampleWithWarning.sampleCode &&
                    sample.sampleTypeSpecificCode === sampleWithWarning.sampleTypeSpecificCode
            );
            newConflictParameters.set(`sampleType${index}`, sampleWithWarning.sampleTypeSpecificCode);
            newConflictParameters.set(`sampleCode${index}`, sampleWithWarning.sampleCode);
        });
        exception.conflict.conflictParameters = newConflictParameters;
    }
    return exception;
}
