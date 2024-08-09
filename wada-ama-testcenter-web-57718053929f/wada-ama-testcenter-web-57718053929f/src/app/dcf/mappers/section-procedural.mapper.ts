import { IDCFState } from '@dcf/store/states/dcf.state';
import { DCF, ProceduralInformation, Timezone } from '@dcf/models';
import { adjustTimezoneToLocal } from '@shared/utils/timezone-utils';

export function dcfToSectionProcedural(dcf: DCF): ProceduralInformation | undefined {
    if (!dcf || !dcf.proceduralInformation) {
        return undefined;
    }

    const { proceduralInformation } = dcf;
    return new ProceduralInformation({
        athleteComment: proceduralInformation.athleteComment || '',
        athleteRepresentative: proceduralInformation.athleteRepresentative || undefined,
        consentForResearch: proceduralInformation.consentForResearch,
        endOfProcedureDate: adjustTimezoneToLocal(proceduralInformation.endOfProcedureDate) || undefined,
        dco: proceduralInformation.dco,
        dcoComment: proceduralInformation.dcoComment || '',
        declarationOfTransfusion: proceduralInformation.declarationOfTransfusion,
        declarationOfSupplements: proceduralInformation.declarationOfSupplements || undefined,
        proceduralIrregularities: proceduralInformation.irregularities || undefined,
        nonConformities: proceduralInformation.nonConformities || undefined,
        timezone: dcf.sampleInformation?.timezone
            ? new Timezone(dcf.sampleInformation.timezone)
            : new Timezone(proceduralInformation.timezone),
    });
}

export function sectionProceduralToDCF(state: IDCFState, form: ProceduralInformation): IDCFState {
    const updatedPI = new ProceduralInformation({
        athleteComment: form.athleteComment,
        athleteRepresentative: form.athleteRepresentative,
        consentForResearch: form.consentForResearch,
        dco: form.dco,
        dcoComment: form.dcoComment,
        declarationOfSupplements: form.declarationOfSupplements,
        declarationOfTransfusion: form.declarationOfTransfusion,
        endOfProcedureDate: adjustTimezoneToLocal(form.endOfProcedureDate),
        irregularities: form.proceduralIrregularities,
        nonConformities: form.nonConformities,
        timezone: form.timezone,
    });

    const updatedDCF = {
        ...state.currentDcf,
        proceduralInformation: updatedPI,
    };

    return { ...state, currentDcf: updatedDCF };
}
