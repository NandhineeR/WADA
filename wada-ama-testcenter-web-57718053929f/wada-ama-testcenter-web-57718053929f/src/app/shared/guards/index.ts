import { CanDeactivateGuard } from './can-deactivate.guard';
import { YearGuard } from './year.guard';

export const guards: Array<any> = [CanDeactivateGuard, YearGuard];

export * from './can-deactivate.guard';
export * from './year.guard';
