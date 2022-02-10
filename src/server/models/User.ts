import db, { IBuilder } from '../db';
import md5 from 'md5';
import Posting, { IPostingRow, IPosting } from './Posting';
import Currency from './Currency';
import { Serializable } from './Common';

/**
 * represents raw data types extracted from database
 */
export interface IUserRow {
    readonly user_id?: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password?: string;
}

/**
 * represents abstracted Posting data type
 */
export interface IUser extends IUserRow {};

/**
 * creates a User instance from a user-like object
 * @param obj object with all intersection types with User
 * @returns User instance
 */
export function createUser(obj: IUser): User {
    return new User(obj.firstName, obj.lastName, obj.email, obj.password, obj.user_id);
}

export interface IPostingSearch {
    posting_id: number;
    title: string;
    currency: Currency;
    description: string;
    posting_date: Date;
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

export class User implements Serializable<IUserJSON> {
    /**
     * SCHEMA:
     * USER {
     *      user_id INTEGER PRIMARY KEY AUTOINCREMENT
     *      firstName TEXT
     *      lastName TEXT
     *      email TEXT
     *      password TEXT
     * }
     */

    private readonly db = db;

    public static tableName = 'Users';

    public user_id?: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;

    private saved: boolean;
    
    constructor (firstName: string, lastName: string, email: string, password: string, user_id?: number) {
        this.user_id = user_id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = md5(password);
        this.saved = Boolean(user_id);
    }

    /**
     * converts server-side object to client-safe representation.
     * @returns JSONified object
     */
    public toJSON = () => {
        const { user_id, firstName, lastName, email } = this;
        const JSONified: IUserJSON = {
            user_id,
            firstName,
            lastName,
            email
        };

        return JSONified;
    };

    public static builder = new class implements IBuilder {

        readonly sampleData = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe8@gmail.com',
                password: md5('password1234')
            },
            {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'janedoe7@yahoo.com',
                password: md5('12345678')
            },
        ];

        /**
         * creates table schema
         * 
         * `async` function 
         */ 
        public buildTable = () => new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS ${User.tableName}
                                (user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                firstName TEXT,
                                lastName TEXT,
                                email TEXT UNIQUE,
                                password TEXT)`, function (err) {
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
            const sql = `INSERT INTO ${User.tableName} (firstName, lastName, email, password)
                              VALUES (?, ?, ?, ?)`;
            await Promise.all(this.sampleData.map(data => new Promise<void>((resolve, reject) => {
                db.run(sql, ...Object.values(data), function (error: Error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            })));
        }
    }();

    /**
     * logs user in based on email and password
     * @param email user email
     * @param password user password (plaintext, unhashed)
     * @returns `User` instance WITH `user_id`
     */
    public static async login(email: string, password: string): Promise<User> {
        return new Promise((resolve, reject) => db.get(`SELECT * FROM Users
                                                        WHERE email = ?
                                                        AND password = ?`,
                                                        email, md5(password),
            function (error: Error, row?: User) {
                if (!row) {
                    reject(new Error('no user found'));
                } else if (error) {
                    reject(error);
                } else {
                    row.saved = true;
                    resolve(row);
                }
            }));
    }

    static build = async (id: number) => new Promise<User>((resolve, reject) =>
        db.get(`SELECT * FROM ${User.tableName}
                WHERE user_id = ?`, id, function (error: Error, row: IUser) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(new User(row.firstName, row.lastName, row.email, row.password, row.user_id));
                    }
                }));

    async fetchPostings(): Promise<Posting[]> {
        if (!this.saved) {
            throw new Error('user does not exist in database');
        } else {
            return new Promise<Posting[]>((resolve, reject) => this.db.all(`SELECT * FROM Postings
                         WHERE author = ?`, this.user_id,
                function (error: Error, rows: Posting[]) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(rows);
                    }
                }));
        }
    }

    async save(): Promise<User> {
        if (this.saved) {
            this.db.run(`UPDATE ${User.tableName}
                         SET firstName = ?, lastName = ?, email = ?, password = ?
                         WHERE user_id = ?`, this.firstName, this.lastName, this.email, this.password, this.user_id);
        } else {
            this.user_id = await new Promise<number>((resolve, reject) =>
                    this.db.run(`INSERT INTO ${User.tableName} (firstName, lastName, email, password)
                                 VALUES (?, ?, ?, ?)`, this.firstName, this.lastName, this.email, this.password,
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
     * search for postings by query
     * @param query search query
     * @param limit optional limit to results, defaults to 10
     * @returns search result, including author
     */
    public async search(query: string, limit: number = 10): Promise<IPostingSearch[]> {
        return new Promise((resolve, reject) => this.db.all(`SELECT * FROM ${Posting.tableName}
                                                             WHERE title LIKE '${query}%' LIMIT ${limit}`,
            async function (err, rows: IPostingRow[]) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Promise.all(rows.map(async row => ({
                        posting_id: row.posting_id,
                        title: row.title,
                        currency: Currency.from(row.currency),
                        description: row.description,
                        image: row.image,
                        price: row.price,
                        posting_date: new Date(row.posting_date),
                        author: (await User.build(row.author)).toJSON()
                    }))));
                }
        }));
    };

    // TODO: finish up this method, write a suggestion algorithm?
    public async suggest(query: string, limit: number = 10): Promise<{}> {
        return new Promise((resolve, reject) => this.db.all(`SELECT * FROM ${Posting.tableName}
                                                             WHERE title LIKE '${query}%' LIMIT ${limit}`,
            function (err, rows: IPostingRow[]) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        posting_id: row.posting_id,
                        title: row.title
                    })));
                }
        }));
    }
}

export default User;
