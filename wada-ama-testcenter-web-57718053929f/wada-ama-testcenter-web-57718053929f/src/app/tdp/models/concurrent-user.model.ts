import { User } from './user.model';

export class ConcurrentUser {
    concurrentUser: Array<User>;

    lastUpdate: number;

    lastUpdateUser: User;

    initialized = false;

    constructor(concurrentUser?: ConcurrentUser) {
        this.concurrentUser = new Array<User>();
        this.lastUpdate = new Date(0).getTime();
        this.lastUpdateUser = new User();

        if (concurrentUser) {
            this.lastUpdateUser = new User(concurrentUser.lastUpdateUser);
            this.lastUpdate = concurrentUser.lastUpdate;
            concurrentUser.concurrentUser.forEach((user: User) => this.concurrentUser.push(new User(user)));
            this.initialized = true;
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof ConcurrentUser)() as this;
        clone.lastUpdate = this.lastUpdate;
        clone.lastUpdateUser = this.lastUpdateUser.clone();
        this.concurrentUser.forEach((user: User) => clone.concurrentUser.push(user.clone()));
        clone.initialized = this.initialized;
        return clone;
    }
}
