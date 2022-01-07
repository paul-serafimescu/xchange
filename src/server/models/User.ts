import db from '../db';
import md5 from 'md5';

export interface IUser {
    readonly id?: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
}

export class User {
    protected readonly db = db;

    private tableName = 'Users';

    public id?: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;
    
    constructor(firstName: string, lastName: string, email: string, password: string) {
        this.id = undefined;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = md5(password);
    }

    static async login(email: string, password: string): Promise<User> {
        return new Promise((resolve, reject) => db.get(`SELECT * FROM Users
                                                        WHERE email = ?
                                                        AND password = ?`,
                                                        email, md5(password),
            function (error: Error, row: User) {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            }));
    }

    async save(): Promise<User> {
        this.id = await new Promise<number>((resolve, reject) => this.db.run(`INSERT INTO ${this.tableName}
                     VALUES (?, ?, ?, ?)`, this.firstName, this.lastName, this.email, this.password,
                     function (error: Error) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(this.lastID); 
                        }
                     }));
        return this;
    }
}
