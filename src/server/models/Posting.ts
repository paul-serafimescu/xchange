import db, { IBuilder } from '../db';
import User from './User';
import Currency from './Currency';
import fs from 'fs';
import path from 'path';
import { Serializable } from './Common';
import { IUserJSON } from './User';

/**
 * represents raw data types extracted from database
 */
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

/**
 * represents abstracted Posting data type
 */
export interface IPosting {
    posting_id?: number;
    author: User;
    postingDate?: Date;
    title: string;
    description: string;
    image?: string;
    price: number;
    currency: Currency;
}

export interface SerializedPosting {
    posting_id?: number;
    author: IUserJSON;
    postingDate?: string;
    title: string;
    description: string;
    image?: string;
    currency: string;
}

export class Posting implements Serializable<SerializedPosting> {
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

    /**
     * model builder instance
     * used for populating default data, creating the database representation, etc. in main.ts
     */
    public static builder = new class implements IBuilder {

        readonly sampleData = [
            {
                author: 2,
                posting_date: new Date().toISOString(),
                title: 'sample title 1',
                description: 'sample description 1',
                image: 'default-placeholder.png',
                price: 675.89,
                currency: 'USD'
            },
            {
                author: 2,
                posting_date: new Date().toISOString(),
                title: 'sample title 2',
                description: 'sample description 2',
                image: '2cdbba22-19d2-450c-bd16-7391df188816.png',
                price: 44.00,
                currency: 'MXN'
            },
        ];

        /**
         * creates table schema
         * 
         * `async` function 
         */ 
        public buildTable = () => new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS ${Posting.tableName}
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

        /**
         * populates table with default data
         * 
         * `async` function
         */
        public populateTable = async () => {
            const sql = `INSERT INTO ${Posting.tableName} (author, posting_date, title, description, image, price, currency)
                              VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await Promise.all(this.sampleData.map(data => new Promise<void>((resolve, reject) => {
                db.run(sql, ...Object.values(data), function (error: Error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                })
            })));
        }
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

    /**
     * build an instance of Posting from a primary key. assumes model already exists
     * @param id Posting primary key
     * @param withAuthor whether or not to include the author data
     */
    public static build = async (id: number, withAuthor = false) => new Promise<Posting>((resolve, reject) => {
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

    /**
     * delete a saved Posting permanently by primary key
     * @param id Posting primary key
     */
    public static delete = async (id: number) => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const posting = await Posting.build(id, true);
                if (posting.image !== 'default-placeholder.png') {
                    fs.unlink(path.join(process.cwd(), 'assets', 'uploads', posting.image), error => {
                        if (error) {
                            return reject(error);
                        }
                    });
                }
            } catch (error) {
                return reject(error);
            }
            db.run(`DELETE FROM ${Posting.tableName} WHERE posting_id = ?`, id, function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * save a Posting to the database
     * 
     * either updates the old posting or inserts a new row depending on the presence of a primary key `posting_id`
     * @returns a Promise with the instance with `posting_id` included, regardless
     */
    public save = async (): Promise<Posting> => {
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

    /**
     * converts server-side representation to client-safe
     */
    public toJSON = () => ({
        posting_id: this.postingId,
        author: this.author.toJSON(),
        title: this.title,
        description: this.description,
        posting_date: this.posting_date.toISOString(),
        currency: Currency.toString(this.currency),
        image: this.image,
        price: this.price,
    });
}

export default Posting;
