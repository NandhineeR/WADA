import { TOApiService } from './to-api.service';
import { UAApiService } from './ua-api.service';

export const services: Array<any> = [TOApiService, UAApiService];

export * from './to-api.service';
export * from './ua-api.service';
