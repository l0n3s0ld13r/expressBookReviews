const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
  };
  
  const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
  };
  

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Invalid username or password" });
    }
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Extract the review from the request query
    const username = req.session.authorization.username; // Get the username from the session

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Check if the book exists in the database
    if (books.hasOwnProperty(isbn)) {
        // Check if the user has already reviewed this book
        if (books[isbn].reviews.hasOwnProperty(username)) {
            // Modify the existing review
            books[isbn].reviews[username] = review;
            return res.status(200).json({ message: "Review modified successfully" });
        } else {
            // Add a new review
            books[isbn].reviews[username] = review;
            return res.status(200).json({ message: "Review added successfully" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get the username from the session


    // Check if the book exists in the database
    if (books.hasOwnProperty(isbn)) {
        // Check if the user has a review for this book
        if (books[isbn].reviews.hasOwnProperty(username)) {
            // Delete the user's review
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(404).json({ message: "User does not have a review for this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
