import { RouterEffects } from './router.effects';
import { UserInfoEffects } from './user-info.effects';
import { LayoutEffects } from './layout.effects';
import { SportNationalitiesEffects } from './sport-nationalities.effects';
import { SportDisciplinesEffects } from './sport-disciplines.effects';
import { OrganizationsEffects } from './organizations.effects';
import { EnterpriseEffects } from './enterprise.effects';

export const effects: Array<any> = [
    RouterEffects,
    UserInfoEffects,
    LayoutEffects,
    SportNationalitiesEffects,
    SportDisciplinesEffects,
    OrganizationsEffects,
    EnterpriseEffects,
];

export * from './router.effects';
export * from './user-info.effects';
export * from './layout.effects';
export * from './sport-nationalities.effects';
export * from './sport-disciplines.effects';
export * from './organizations.effects';
export * from './enterprise.effects';
