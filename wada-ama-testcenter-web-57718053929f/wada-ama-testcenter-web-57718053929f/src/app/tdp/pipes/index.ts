import { YearlyTotalForDisciplinePipe } from './yearly-total-for-discipline.pipe';
import { ReplaceZeroWithBlankPipe } from './replace-zero-with-blank.pipe';
import { HasDisabledRowsPipe } from './has-disabled-rows.pipe';
import { HasOnlyDisabledRowsPipe } from './has-only-disabled-rows.pipe';
import { GetDisablingPeriodPipe } from './get-disabling-period.pipe';
import { IsParentPeriodPipe } from './is-parent-period.pipe';
import { GetPeriodTypePipe } from './get-period-type.pipe';
import { GetPeriodPipe } from './get-period.pipe';
import { GetQuarterPipe } from './get-quarter.pipe';
import { GetBySampleTypePipe } from './get-by-sample-type.pipe';
import { GetByAnalysisCategoryPipe } from './get-by-analysis-category.pipe';
import { GetInitialsFromNamePipe } from './get-initials-from-name.pipe';
import { TDPTotalsAreNotZeroPipe } from './tdp-totals-are-not-zero.pipe';
import { SportsNotDeletedPipe } from './sports-not-deleted.pipe';
import { DisciplinesNotDeletedPipe } from './disciplines-not-deleted.pipe';

export const pipes: Array<any> = [
    YearlyTotalForDisciplinePipe,
    ReplaceZeroWithBlankPipe,
    HasDisabledRowsPipe,
    HasOnlyDisabledRowsPipe,
    GetDisablingPeriodPipe,
    IsParentPeriodPipe,
    GetPeriodTypePipe,
    GetPeriodPipe,
    GetQuarterPipe,
    GetInitialsFromNamePipe,
    GetBySampleTypePipe,
    GetByAnalysisCategoryPipe,
    TDPTotalsAreNotZeroPipe,
    SportsNotDeletedPipe,
    DisciplinesNotDeletedPipe,
];

export * from './yearly-total-for-discipline.pipe';
export * from './replace-zero-with-blank.pipe';
export * from './has-disabled-rows.pipe';
export * from './has-only-disabled-rows.pipe';
export * from './get-disabling-period.pipe';
export * from './is-parent-period.pipe';
export * from './get-period-type.pipe';
export * from './get-period.pipe';
export * from './get-quarter.pipe';
export * from './get-initials-from-name.pipe';
export * from './get-by-sample-type.pipe';
export * from './get-by-analysis-category.pipe';
export * from './tdp-totals-are-not-zero.pipe';
export * from './sports-not-deleted.pipe';
export * from './disciplines-not-deleted.pipe';
