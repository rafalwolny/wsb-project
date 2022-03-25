CREATE TABLE books(
	book_id INT PRIMARY KEY AUTO_INCREMENT,
	book_title VARCHAR(60),
	book_author VARCHAR(60),
	book_year INT
);

INSERT INTO books(book_title, book_author, book_year) VALUES("A Tale of Two Cities", "Charles Dickens", 1859);
INSERT INTO books(book_title, book_author, book_year) VALUES("The Hobbit", "J. R. R. Tolkien", 1937);

ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';

flush privileges;
