import db, { IBuilder } from '../db';
import md5 from 'md5';
import Posting from './Posting';

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

export class User {
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

    protected readonly db = db;

    public static tableName = 'Users';

    public user_id?: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;

    private saved: boolean;
    
    constructor(firstName: string, lastName: string, email: string, password: string, user_id?: number) {
        this.user_id = user_id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = md5(password);
        this.saved = Boolean(user_id);
    }

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
}

export default User;
