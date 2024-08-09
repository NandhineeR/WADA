import { FromToDate } from '@shared/models';
import { TestTypeToShow } from 'app/tdpm/models';

export interface ITDPMFiltersState {
    isCollapsed: boolean;
    showTestType: TestTypeToShow;
    dateRange: FromToDate;
}

export const initialTdpmFilterState: ITDPMFiltersState = {
    isCollapsed: true,
    showTestType: TestTypeToShow.CompleteNoLabResultMatched,
    dateRange: new FromToDate(0, new Date().getFullYear(), new Date().getMonth(), new Date().getFullYear()),
};
