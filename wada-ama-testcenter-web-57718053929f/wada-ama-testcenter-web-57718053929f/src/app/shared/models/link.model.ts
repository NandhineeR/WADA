export class Link {
    message: string;

    link: string;

    constructor(link?: Link) {
        this.message = link?.message || '';
        this.link = link?.link || '';
    }
}
