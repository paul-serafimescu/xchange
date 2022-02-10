import ICurrency from '../../../shared/ICurrency';

export interface IPostingSearch {
    posting_id: number;
    title: string;
    currency: ICurrency;
    description: string;
    posting_date: string;
    image: string;
    price: number;
    author: IUserJSON;
}

export interface IUserJSON {
    user_id?: number;
    firstName: string;
    lastName: string;
    email: string;
}

export default IUserJSON;
