import { Database as SQLite3 } from "sqlite3";
import { DB_PATH } from "./config";

export interface IBuilder {
    buildTable: () => Promise<void>;
}

export class Database extends SQLite3 {
    public initialize(...models: IBuilder[]): void {
        Promise.all(models.map(model => model.buildTable()))
            .then(() => console.log('database ready...'))
            .catch(err => console.error(err));
    }
}

export default new Database(DB_PATH, error => {
    if (error)
        console.error(error)
});
