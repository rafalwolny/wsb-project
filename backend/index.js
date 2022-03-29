const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

app.use(cors());
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const connection = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

app.get('/search_all', (req, res) => {
  const query = "SELECT * FROM books;";
  connection.query(query, (err, rows) => {
    if (err) {
      res.json({
        success: false, err
      });
    }
    else {
      res.json({
        success: true, rows
      });
    }
  });
});

app.get('/search_book', (req, res) => {
  const searchValue = `%${req.body.book_title}%`;
  const query = "SELECT * FROM books WHERE book_title LIKE ?;";
  connection.query(query, searchValue, (err, rows) => {
    if (err) {
      res.json({
        success: false, err
      });
    }
    else {
      res.json({
        success: true, rows
      });
    }
  });
});

app.post("/add_book", (req, res) => {
  const query = "INSERT INTO books(book_title, book_author, book_year) VALUES(?, ?, ?);";
  connection.query(
    query, 
    [req.body.book_title, req.body.book_author, req.body.book_year], 
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else res.status(200).send("request delivered");
    }
  ); 
});

app.listen(3000, () => console.log('listining on port 3000'));
