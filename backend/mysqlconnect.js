const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  password: "32243224",
  database: "dbautio",
});

module.exports = pool;