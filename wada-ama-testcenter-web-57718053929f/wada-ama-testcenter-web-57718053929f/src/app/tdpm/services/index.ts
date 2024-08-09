import { TDPMApiService } from './tdpm-api.service';
import { TDPMToCSVConvertorService } from './tdpm-to-csv-convertor.service';

export const services: Array<any> = [TDPMApiService, TDPMToCSVConvertorService];

export * from './tdpm-api.service';
export * from './tdpm-to-csv-convertor.service';
