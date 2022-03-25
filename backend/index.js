const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

app.use(cors());

const connection = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM books', (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err
      });
    }
    else {
      res.json({
        success: true,
        rows
      });
    }
  });
});

app.listen(3000, () => console.log('listining on port 3000'));
