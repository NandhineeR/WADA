import { IUser } from '@core/models';

export class User implements IUser {
    firstName: string;

    lastName: string;

    username: string;

    userId: string;

    userType: string;

    constructor(user?: User) {
        this.username = user?.username || '';
        this.firstName = user?.firstName || '';
        this.lastName = user?.lastName || '';
        this.userId = user?.userId || '';
        this.userType = user?.userType || '';
    }

    clone(): this {
        const clone = new (this.constructor as typeof User)() as this;
        clone.username = this.username;
        clone.firstName = this.firstName;
        clone.lastName = this.lastName;
        return clone;
    }

    getInitials(): string {
        return this.lastName.charAt(0).toUpperCase();
    }
}
