import { CanDeactivateGuard } from './can-deactivate.guard';
import { TORouteGuard } from './to-route.guard';
import { UACanDeactivateGuard } from './ua-can-deactivate.guard';

export const guards: Array<any> = [TORouteGuard, CanDeactivateGuard, UACanDeactivateGuard];

export * from './can-deactivate.guard';
export * from './ua-can-deactivate.guard';
export * from './to-route.guard';
