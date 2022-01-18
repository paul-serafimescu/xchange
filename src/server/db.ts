import { Database as SQLite3 } from "sqlite3";
import { DB_PATH } from "./config";

export interface IBuilder {
    buildTable: () => Promise<void>;
    populateTable?: () => Promise<void>;
}

export class Database extends SQLite3 {

    constructor(filename: string, callback?: (err: Error) => void) {
        super(filename, callback);
    }

    public async initialize(...models: IBuilder[]): Promise<void> {
        return Promise.all(models.map(model => model.buildTable()))
            .then(() => console.log('database ready...'))
            .catch(err => console.error(err));
    }

    public async populateDefaults(...models: IBuilder[]): Promise<void> {
        return Promise.all(models.map(model => model.populateTable()))
            .then(() => console.log('database populated...'))
            .catch(err => console.error(err));
    }
}

export default new Database(DB_PATH, error => {
    if (error)
        console.error(error)
});
