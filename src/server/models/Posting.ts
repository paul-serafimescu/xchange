import db, { IBuilder } from '../db';
import User from './User';

export interface IPostingRow {
    readonly posting_id: number;
    readonly author: number;
    readonly posting_date: string;
    readonly title: string;
    readonly description: string;
    readonly image?: string;
    readonly price: number;
    readonly currency: Currency.Code;
}

export interface IPosting {
    readonly posting_id?: number;
    readonly author: User;
    readonly postingDate?: Date;
    readonly title: string;
    readonly description: string;
    readonly image?: string;
    readonly price: number;
    readonly currency: Currency;
}

/**
 * TODO: Image Field and Currency
 * idea: namespace/enum merging
 */

/**
 * numeric enum representation of currency
 */
export enum Currency {
    USD, ILS, MXN, UNKNOWN
}

export namespace Currency {
    export const Translation = {
        USD: Currency.USD,
        ILS: Currency.ILS,
        MXN: Currency.MXN,
    };

    export type Code = keyof typeof Translation;

    export function toString(c: Currency): string {
        console.log("stringified:", Currency[c]);
        return Currency[c];
    }

    export function from(str: string): Currency {
        return Translation[str] ?? Currency.UNKNOWN;
    }
}

export class Posting {
    /**
     * SCHEMA:
     * POSTING {
     *      posting_id INTEGER PRIMARY KEY AUTOINCREMENT
     *      author INTEGER 
     *      posting_date TEXT
     *      title TEXT
     *      description TEXT
     *      image TEXT
     *      FOREIGN KEY(author) REFERENCES Users(user_id)
     * }
     */

    protected readonly db = db;

    public static tableName = 'Postings';

    public postingId?: number;
    public author: User;
    public posting_date?: Date;
    public title: string;
    public description: string;
    public image?: string;
    public price: number;
    public currency: Currency;
    private saved: boolean;

    public static builder = new class implements IBuilder {
        public buildTable = () => new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Postings
                                (posting_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                author INTEGER,
                                posting_date TEXT,
                                title TEXT,
                                description TEXT,
                                image TEXT NOT NULL,
                                price REAL NOT NULL,
                                currency VARCHAR(3),
                                FOREIGN KEY(author) REFERENCES Users(user_id))`, function (err) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
        });
    }();

    /**
     * @param author must be saved in the database (i.e. has a user_id)
     * @param title title of posting
     * @param description posting description
     * @param postingId if already created, the posting id
     * @param postingDate date posted (if already saved)
     * @param image posting image
     * @param price posting price
     * @param currency posting currency code
     */
    constructor(author: User, title: string, description: string, price: number, currency: Currency.Code, postingId?: number, postingDate?: Date, image?: string) {
        this.postingId = postingId;
        this.author = author;
        this.title = title;
        this.description = description;
        this.posting_date = postingDate;
        this.image = image ?? null;
        this.saved = Boolean(postingId);
        this.price = price;
        this.currency = Currency.from(currency);
    }

    static build = async (id: number, withAuthor = false) => new Promise<Posting>((resolve, reject) => {
        db.get(`SELECT * FROM ${Posting.tableName}
                WHERE posting_id = ?`, id, async function (error: Error, row: IPostingRow) {
                    if (error) {
                        reject(error);
                    } else {
                        try {
                            const user = withAuthor ? await User.build(row.author) : undefined;
                            resolve(new Posting(user, row.title, row.description, row.price, row.currency, row.posting_id, new Date(row.posting_date), row.image));
                        } catch (error) {
                            reject(error);
                        }
                    }
        });
    });

    static delete = async (id: number) => new Promise<void>((resolve, reject) => {
        db.run(`DELETE FROM ${Posting.tableName} WHERE posting_id = ?`, id, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });

    save = async (): Promise<Posting> => {
        this.posting_date = new Date();
        if (this.saved) {
            this.db.run(`UPDATE ${Posting.tableName}
                         SET author = ?, title = ?, description = ?, posting_date = ?, image = ?, price = ?, currency = ?
                         WHERE posting_id = ?`, this.author.user_id, this.title, this.description, this.posting_date.toISOString(), this.image ?? null, this.price, Currency.toString(this.currency), this.postingId);
        } else {
            this.postingId = await new Promise<number>((resolve, reject) =>
                this.db.run(`INSERT INTO ${Posting.tableName} (author, title, description, posting_date, image, price, currency)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`, this.author.user_id, this.title, this.description, this.posting_date.toISOString(), this.image ?? null, this.price, Currency.toString(this.currency),
                    function (error: Error) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(this.lastID);
                        }
                    }));
        }
        return this;
    }
}

export default Posting;
