import { CanDeactivateGuard } from './can-deactivate.guard';
import { DCFRouteGuard } from './dcf-route.guard';

export const guards: Array<any> = [DCFRouteGuard, CanDeactivateGuard];

export * from './can-deactivate.guard';
export * from './dcf-route.guard';
