import { DisplayDescriptionNamePipe } from './display-description-name.pipe';
import { GetAthleteSelectedPipe } from './get-athlete-selected.pipe';
import { SampleAccumulatorPipe } from './sample-acumulator.pipe';
import { SampleTypePipe } from './sample-type.pipe';
import { TrimTestingOrderNumberPipe } from './trim-testing-order-number.pipe';

export const pipes: Array<any> = [
    DisplayDescriptionNamePipe,
    GetAthleteSelectedPipe,
    SampleAccumulatorPipe,
    SampleTypePipe,
    TrimTestingOrderNumberPipe,
];

export * from './display-description-name.pipe';
export * from './get-athlete-selected.pipe';
export * from './sample-acumulator.pipe';
export * from './sample-type.pipe';
export * from './trim-testing-order-number.pipe';
