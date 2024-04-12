const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!isValid(username)) {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});
      }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Function to fetch the list of books from the database
const getBookList = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject("Unable to fetch books");
            }
        }, 1000);
    });
};

// Route to get the list of books available in the shop
public_users.get('/', (req, res) => {
    getBookList()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(500).json({ message: "Internal Server Error" });
        });
});

// Function to fetch book details based on ISBN from the database
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundBook = Object.values(books).find(book => book.isbn === isbn);
            if (foundBook) {
                resolve(foundBook);
            } else {
                reject("Book not found");
            }
        }, 1000); 
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function(req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(404).send(error);
        });
});

// Function to fetch books by author from the database
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByAuthor = Object.values(books).filter(book => book.author === author);
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject("Books by the author not found");
            }
        }, 1000);
    });
};

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(404).send(error);
        });
});

// Function to fetch books by title from the database
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksWithTitle = Object.values(books).filter(book => book.title === title);
            if (booksWithTitle.length > 0) {
                resolve(booksWithTitle);
            } else {
                reject("Books with the title not found");
            }
        }, 1000);
    });
};

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(404).send(error);
        });
});

// Get book reviews
public_users.get('/review/:isbn', function(req, res) {
    const isbn = String(req.params.isbn); // Convert ISBN to string
    // Check if the book with the provided ISBN exists in the database
    if (books.hasOwnProperty(isbn)) {
        res.send(books[isbn]);
    } else {
        res.status(404).send("Book not found");
    }
});

module.exports.general = public_users;
