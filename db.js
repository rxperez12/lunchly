/** Database for lunchly */

import pg from "pg";
const { Client } = pg;

const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///lunchly_test"
    : "postgresql:///lunchly";

let db = new Client({
  connectionString: DB_URI,
});

db.connect();


export default pg;
