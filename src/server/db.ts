import { Database } from "sqlite3";
import { DB_PATH } from "./config";

export default new Database(DB_PATH, error => {
    if (error)
        console.error(error)
});
