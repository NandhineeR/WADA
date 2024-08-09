import { RoleGuard } from './role.guard';
import { ExternalUrlGuard } from './external-url.guard';

export const guards: Array<any> = [RoleGuard, ExternalUrlGuard];

export * from './role.guard';
export * from './external-url.guard';
