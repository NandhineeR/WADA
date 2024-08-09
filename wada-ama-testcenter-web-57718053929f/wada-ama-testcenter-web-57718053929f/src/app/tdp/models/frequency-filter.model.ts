import { Month, PeriodType, Quarter } from './period.enum';

export interface IFrequencyFilter {
    frequency: PeriodType;
    quarter: Quarter;
    month: Month;
}
