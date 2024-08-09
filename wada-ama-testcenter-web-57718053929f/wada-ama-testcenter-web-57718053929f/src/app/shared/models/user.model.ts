import { IUser } from '@core/models';

export class User implements IUser {
    firstName: string;

    lastName: string;

    username: string;

    userId: string;

    sex: string;

    userType: string;

    constructor(user?: Partial<User> | null) {
        const { firstName = '', lastName = '', username = '', sex = '', userId = '', userType = '' } = user || {};
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.userId = userId;
        this.sex = sex;
        this.userType = userType;
    }
}
