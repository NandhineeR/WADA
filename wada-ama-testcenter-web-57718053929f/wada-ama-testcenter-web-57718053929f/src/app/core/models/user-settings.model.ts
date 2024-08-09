import { IPreferences } from '@core/models/preferences.model';
import { IUser } from './user.model';

export interface IUserSettings {
    preferences: IPreferences;
    roles: Array<string>;
    profile: IUser;
}
