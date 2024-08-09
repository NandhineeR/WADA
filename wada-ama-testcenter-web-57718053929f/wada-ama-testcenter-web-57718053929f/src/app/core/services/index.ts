import { DirectionalityService } from './directionality.service';
import { CoreApiService } from './core-api.service';
import { PopoverService } from './popover.service';
import { TooltipService } from './tooltip.service';
import { PersistanceService } from './persistance.service';
import { TranslationService } from './translation.service';

export const services: Array<any> = [
    DirectionalityService,
    CoreApiService,
    PopoverService,
    TooltipService,
    PersistanceService,
    TranslationService,
];

export * from './directionality.service';
export * from './core-api.service';
export * from './popover.service';
export * from './tooltip.service';
export * from './persistance.service';
export * from './translation.service';
