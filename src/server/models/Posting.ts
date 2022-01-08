import db from '../db';
import User from './User';

export interface IPosting {
    readonly posting_id?: number;
    readonly author: User;
    readonly postingDate?: Date;
    readonly title: string;
    readonly description: string;
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
     *      FOREIGN KEY(author) REFERENCES Users(user_id)
     * }
     */

    protected readonly db = db;

    public static tableName = 'Postings';

    public postingId?: number;
    public author: User;
    public postingDate?: Date;
    public title: string;
    public description: string;
    private saved: boolean;

    /**
     * @param author must be saved in the database (i.e. has a user_id)
     * @param title title of posting
     * @param description posting description
     * @param postingId if already created, the posting id
     * @param postingDate date posted (if already saved)
     */
    constructor(author: User, title: string, description: string, postingId?: number, postingDate?: Date) {
        this.postingId = postingId;
        this.author = author;
        this.title = title;
        this.description = description;
        this.postingDate = postingDate;
        this.saved = Boolean(postingId);
    }

    async save(): Promise<Posting> {
        this.postingDate = new Date();
        if (this.saved) {
            this.db.run(`UPDATE ${Posting.tableName}
                         SET author = ?, title = ?, description = ?, posting_date = ?
                         WHERE posting_id = ?`, this.author.user_id, this.title, this.description, this.postingDate.toISOString(), this.postingId);
        } else {
            this.postingId = await new Promise<number>((resolve, reject) =>
                this.db.run(`INSERT INTO ${Posting.tableName} (author, title, description, posting_date)
                             VALUES (?, ?, ?, ?)`, this.author.user_id, this.title, this.description, this.postingDate.toISOString(),
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
