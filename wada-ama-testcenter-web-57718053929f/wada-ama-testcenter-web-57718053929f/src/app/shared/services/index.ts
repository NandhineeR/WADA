import { ConfirmLeaveService } from './confirm-leave.service';
import { GenericActivityApiService } from './generic-activity-api.service';
import { LinkedColumnsMapService } from './linked-columns-map.service';
import { MajorEventApiService } from './major-event-api.service';
import { TableTranslationService } from './table-translation.service';

export const services: Array<any> = [
    ConfirmLeaveService,
    GenericActivityApiService,
    LinkedColumnsMapService,
    MajorEventApiService,
    TableTranslationService,
];

export * from './confirm-leave.service';
export * from './generic-activity-api.service';
export * from './linked-columns-map.service';
export * from './major-event-api.service';
export * from './table-translation.service';
