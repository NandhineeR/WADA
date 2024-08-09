import { AthleteGroup } from './athlete-group.model';

export interface IAthleteGroupView {
    groupId: string;
    title: string;
    data: AthleteGroup;
    singleGroup: boolean;
    active: boolean;
}
