import { NumberOfErrorsPerCategory } from './form-util';

export function numberOfErrorPerCategoryValidation(
    a: NumberOfErrorsPerCategory,
    b: NumberOfErrorsPerCategory
): boolean {
    return (
        a.Business === b.Business &&
        a.Format === b.Format &&
        a.Mandatory === b.Mandatory &&
        a.MandatoryDraft === b.MandatoryDraft &&
        a.Warning === b.Warning
    );
}
