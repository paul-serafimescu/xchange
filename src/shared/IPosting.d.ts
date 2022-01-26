import type IUser from './IUser';

declare interface IPosting {
    readonly posting_id?: number;
    readonly author: IUser;
    readonly posting_date?: Date;
    readonly title: string;
    readonly description: string;
    readonly image?: string;
    readonly price: number;
    readonly currency: string;
}

export default IPosting;
