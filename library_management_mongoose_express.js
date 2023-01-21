const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    ISBN: {
        type: String,
        required: true
    },
    copies: {
        type: Number,
        required: true
    }
});

bookSchema.methods.checkAvailability = function () {
    return this.copies > 0;
}

bookSchema.methods.borrowBook = function () {
    if (this.copies > 0) {
        this.copies--;
        return true;
    } else {
        return false;
    }
}

const Book = mongoose.model('Book', bookSchema);

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    studentID: {
        type: String,
        required: true
    },
    contact: {
        type: String
    }
});

studentSchema.methods.checkBorrowedBooks = function () {
    return Transaction.find({
        student: this._id,
        type: "borrow"
    });
}

studentSchema.methods.returnBook = function (book) {
    return Transaction.findOneAndUpdate({
        student: this._id,
        book: book._id,
        type: "borrow"
    }, {
        type: "return"
    });
}

const Student = mongoose.model('Student', studentSchema);

const transactionSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const librarianSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    librarianID: {
        type: String,
        required: true
    },
    contact: {
        type: String
    }
});

librarianSchema.methods.addBook = function (book) {
    return Book.create(book);
}

librarianSchema.methods.deleteBook = function (book) {
    return Book.findByIdAndDelete(book._id);
}

const Librarian = mongoose.model('Librarian', librarianSchema);

const librarySchema = new mongoose.Schema({
    location: {
        type: String
    },
    contact: {
        type: String
    }
});

librarySchema.methods.searchBook = function (query) {
    return Book.find(query);
}

librarySchema.methods.generateReport = function () {
    return Transaction.aggregate([{
            $match: {
                type: "borrow"
            }
        },
        {
            $group: {
                _id: "$book",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                count: -1
            }
        }
    ]);
}
'const express = require('
express ');
const router = express.Router();
const Book = require('path/to/bookModel');
const Student = require('path/to/studentModel');
const Transaction = require('path/to/transactionModel');
const Librarian = require('path/to/librarianModel');
const Library = require('path/to/libraryModel');

// create route for books
router.post('/books', async (req, res) => {
    try {
        const book = await Book.create(req.body);
        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// get route for books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// get route for specific book
router.get('/books/:id', getBook, (req, res) => {
    res.json(res.book);
});

// update route for specific book
router.patch('/books/:id', getBook, async (req, res) => {
    if (req.body.title != null) {
        res.book.title = req.body.title;
    }
    if (req.body.author != null) {
        res.book.author = req.body.author;
    }
    if (req.body.ISBN != null) {
        res.book.ISBN = req.body.ISBN;
    }
    if (req.body.copies != null) {
        res.book.copies = req.body.copies;
    }
    try {
        const updatedBook = await res.book.save();
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// delete route for specific book
router.delete('/books/:id', getBook, async (req, res) => {
    try {
        await res.book.remove();
        res.json({
            message: 'Deleted This Book'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// middleware function for getting specific book
async function getBook(req, res, next) {
    let book;
    try {
        book = await Book.findById(req.params.id);
        if (book == null) {
            return res.status(404).json({
                message: 'Cannot find book'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
    res.book = book;
    next();
}

const express = require('express');
const router = express.Router();
const Student = require('path/to/studentModel');

// create route for students
router.post('/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// get route for students
router.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// get route for specific student
router.get('/students/:id', getStudent, (req, res) => {
    res.json(res.student);
});

// update route for specific student
router.patch('/students/:id', getStudent, async (req, res) => {
    if (req.body.name != null) {
        res.student.name = req.body.name;
    }
    if (req.body.studentID != null) {
        res.student.studentID = req.body.studentID;
    }
    if (req.body.contact != null) {
        res.student.contact = req.body.contact;
    }
    try {
        const updatedStudent = await res.student.save();
        res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// delete route for specific student
router.delete('/students/:id', getStudent, async (req, res) => {
    try {
        await res.student.remove();
        res.json({
            message: 'Deleted This Student'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// middleware function for getting specific student
async function getStudent(req, res, next) {
    let student;
    try {
        student = await Student.findById(req.params.id);
        if (student == null) {
            return res.status(404).json({
                message: 'Cannot find student'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
    res.student = student;
    next();
}

router.patch('/books/:id/return', getBook, async (req, res) => {
    try {
        const student = await Student.findById(req.body.studentID);
        if (!student) {
            return res.status(404).json({
                message: 'Cannot find student'
            });
        }
        const returnedBook = await student.returnBook(res.book);
        res.json(returnedBook);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});


router.get('/students/:id/books', getStudent, async (req, res) => {
    try {
        const borrowedBooks = await res.student.checkBorrowedBooks();
        res.json(borrowedBooks);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

const express = require('express');
const router = express.Router();
const Transaction = require('path/to/transactionModel');

// create route for transactions
router.post('/transactions', async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        res.status(201).json(transaction);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// get route for transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// get route for specific transaction
router.get('/transactions/:id', getTransaction, (req, res) => {
    res.json(res.transaction);
});

// update route for specific transaction
router.patch('/transactions/: id ', getTransaction, async (req, res) => {
    if (req.body.book != null) {
        res.transaction.book = req.body.book;
    }
    if (req.body.student != null) {
        res.transaction.student = req.body.student;
    }
    if (req.body.date != null) {
        res.transaction.date = req.body.date;
    }
    if (req.body.type != null) {
        res.transaction.type = req.body.type;
    }
    try {
        const updatedTransaction = await res.transaction.save();
        res.json(updatedTransaction);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// delete route for specific transaction
router.delete('/transactions/:id', getTransaction, async (req, res) => {
    try {
        await res.transaction.remove();
        res.json({
            message: 'Deleted This Transaction'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// middleware function for getting specific transaction
async function getTransaction(req, res, next) {
    let transaction;
    try {
        transaction = await Transaction.findById(req.params.id);
        if (transaction == null) {
            return res.status(404).json({
                message: 'Cannot find transaction'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
    res.transaction = transaction;
    next();
}

const express = require('express');
const router = express.Router();
const Librarian = require('path/to/librarianModel');

// create route for librarians
router.post('/librarians', async (req, res) => {
    try {
        const librarian = await Librarian.create(req.body);
        res.status(201).json(librarian);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// get route for librarians
router.get('/librarians', async (req, res) => {
    try {
        const librarians = await Librarian.find();
        res.json(librarians);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// get route for specific librarian
router.get('/librarians/:id', getLibrarian, (req, res) => {
    res.json(res.librarian);
});

// update route for specific librarian
router.patch('/librarians/:id', getLibrarian, async (req, res) => {
    if (req.body.name != null) {
        res.librarian.name = req.body.name;
    }
    if (req.body.employeeID != null) {
        res.librarian.employeeID = req.body.employeeID;
    }
    if (req.body.contact != null) {
        res.librarian.contact = req.body.contact;
    }
    try {
        const updatedLibrarian = await res.librarian.save();
        res.json(updatedLibrarian);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// delete route for specific librarian
router.delete('/librarians/:id', getLibrarian, async (req, res) => {
    try {
        await res.librarian.remove();
        res.json({
            message: 'Deleted This Librarian'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// middleware function for getting specific librarian
async function getLibrarian(req, res, next) {
    let librarian;
    try {
        librarian = await Librarian.findById(req.params.id);
        if (librarian == null) {
            return res.status(404).json({
                message: 'Cannot find librarian'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
    res.librarian = librarian;
    next();
}

router.post('/librarians/:id/addbook', getLibrarian, async (req, res) => {
    try {
        const addedBook = await res.librarian.addBook(req.body);
        res.status(201).json(addedBook);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

router.delete('/librarians/:id/deletebook/:bookId', getLibrarian, async (req, res) => {
    try {
        const deletedBook = await res.librarian.deleteBook(req.params.bookId);
        res.json(deletedBook);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

const express = require('express');
const router = express.Router();
const Library = require('path/to/libraryModel');

// create route for library
router.post('/library', async (req, res) => {
    try {
        const library = await Library.create(req.body);
        res.status(201).json(library);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// get route for library
router.get('/library', async (req, res) => {
    try {
        const library = await Library.find();
        res.json(library);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// update route for library
router.patch('/library/:id', async (req, res) => {
    try {
        const library = await Library.findById(req.params.id);
        if (!library) {
            return res.status(404).json({
                message: 'Cannot find library'
            });
        }
        if (req.body.name != null) {
            library.name = req.body.name;
        }
        if (req.body.location != null) {
            library.location = req.body.location;
        }
        if (req.body.books != null) {
            library.books = req.body.books;
        }
        if (req.body.librarians != null) {
            library.librarians = req.body.librarians;
        }
        const updatedLibrary = await library.save();
        res.json(updatedLibrary);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// delete route for library
router.delete('/library/:id', async (req, res) => {
    try {
        const library = await Library.findById(req.params.id);
        if (!library) {
            return res.status(404).json({
                message: 'Cannot find library'
            });
        }
        await library.remove();
        res.json({
            message: 'Deleted This Library'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/library/generateReport', async (req, res) => {
    try {
        const library = await Library.findOne();
        if (!library) {
            return res.status(404).json({
                message: 'Cannot find library'
            });
        }
        const report = await library.generateReport();
        res.json(report);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});