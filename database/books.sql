CREATE TABLE books(
	book_id INT PRIMARY KEY AUTO_INCREMENT,
	book_title VARCHAR(60),
	book_author VARCHAR(60),
	book_year INT
);

INSERT INTO books(book_title, book_author, book_year) VALUES("The Little Prince", "Antoine de Saint-Exupery", 1943);
INSERT INTO books(book_title, book_author, book_year) VALUES("The Alchemist", "	Paulo Coelho", 1988);
INSERT INTO books(book_title, book_author, book_year) VALUES("A Tale of Two Cities", "Charles Dickens", 1859);
INSERT INTO books(book_title, book_author, book_year) VALUES("The Da Vinci Code", "Dan Brown", 2003);
INSERT INTO books(book_title, book_author, book_year) VALUES("Harry Potter and the Chamber of Secrets", "J. K. Rowling", 1998);
INSERT INTO books(book_title, book_author, book_year) VALUES("Anne of Green Gables", "Lucy Maud Montgomery", 1908);
INSERT INTO books(book_title, book_author, book_year) VALUES("The Name of the Rose", "Umberto Eco", 1980);
INSERT INTO books(book_title, book_author, book_year) VALUES("The Very Hungry Caterpillar", "Eric Carle", 1969);
INSERT INTO books(book_title, book_author, book_year) VALUES("The Lord of the Rings", "J. R. R. Tolkien", 1968);
INSERT INTO books(book_title, book_author, book_year) VALUES("Harry Potter and the Philosopher's Stone", "J. K. Rowling", 1997);

ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';

flush privileges;
