const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/budget_app', {
    useNewUrlParser: true
});

const budgetSchema = new mongoose.Schema({
    name: String,
    income: Number,
    expenses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    }]
});
const Budget = mongoose.model('Budget', budgetSchema);

const expenseSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    budget: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
    }
});
const Expense = mongoose.model('Expense', expenseSchema);

const incomeSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    budget: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
    }
});
const Income = mongoose.model('Income', incomeSchema);

const express = require('express');
const app = express();

// Create a budget
app.post('/budgets', (req, res) => {
    const budget = new Budget(req.body);
    budget.save()
        .then(budget => res.json(budget))
        .catch(err => res.status(400).json(err));
});

// Get all budgets
app.get('/budgets', (req, res) => {
    Budget.find()
        .populate('expenses')
        .then(budgets => res.json(budgets))
        .catch(err => res.status(400).json(err));
});

// Get a single budget
app.get('/budgets/:id', (req, res) => {
    Budget.findById(req.params.id)
        .populate('expenses')
        .then(budget => res.json(budget))
        .catch(err => res.status(400).json(err));
});

// Update a budget
app.patch('/budgets/:id', (req, res) => {
    Budget.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
        .then(budget => res.json(budget))
        .catch(err => res.status(400).json(err));
});

// Delete a budget
app.delete('/budgets/:id', (req, res) => {
    Budget.findByIdAndDelete(req.params.id)
        .then(budget => res.json(budget))
        .catch(err => res.status(400).json(err));
});

// Create an expense
app.post('/expenses', (req, res) => {
    const expense = new Expense(req.body);
    expense.save()
        .then(expense => res.json(expense))
        .catch(err => res.status(400).json(err));
});

// Get all expenses
app.get('/expenses', (req, res) => {
    Expense.find()
        .populate('budget')
        .then(expenses => res.json(expenses))
        .catch(err => res.status(400).json(err));
});

// Get a single expense
app.get('/expenses/:id', (req, res) => {
    Expense.findById(req.params.id)
        .populate('budget')
        .then(expense => res.json(expense))
        .catch(err => res.status(400).json(err));
});

// Update an expense
app.patch('/expenses/:id', (req, res) => {
    Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
        .then(expense => res.json(expense))
        .catch(err => res.status(400).json(err));
});

// Delete an expense
app.delete('/expenses/:id', (req, res) => {
    Expense.findByIdAndDelete(req.params.id)
        .then(expense => res.json(expense))
        .catch(err => res.status(400).json(err));
});

// Create an income
app.post('/incomes', (req, res) => {
    const income = new Income(req.body);
    income.save()
        .then(income => res.json(income))
        .catch(err => res.status(400).json(err));
});

// Get all incomes
app.get('/incomes', (req, res) => {
    Income.find()
        .populate('budget')
        .then(incomes => res.json(incomes))
        .catch(err => res.status(400).json(err));
});

// Get a single income
app.get('/incomes/:id', (req, res) => {
    Income.findById(req.params.id)
        .populate('budget')
        .then(income => res.json(income))
        .catch(err => res.status(400).json(err));
});

// Update an income
app.patch('/incomes/:id', (req, res) => {
    Income.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
        .then(income => res.json(income))
        .catch(err => res.status(400).json(err));
});

// Delete an income
app.delete('/incomes/:id', (req, res) => {
    Income.findByIdAndDelete(req.params.id)
        .then(income => res.json(income))
        .catch(err => res.status(400).json(err));
});

// Generate reports
app.get('/reports/:budgetId', (req, res) => {
    Budget.findById(req.params.budgetId)
        .populate('expenses')
        .populate('income')
        .then(budget => {
            let expenses = budget.expenses;
            let income = budget.income;
            let totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
            let totalIncome = income.reduce((acc, inc) => acc + inc.amount, 0);
            let report = {
                budgetName: budget.name,
                totalExpenses,
                totalIncome,
                balance: totalIncome - totalExpenses
            }
            res.json(report);
        })
        .catch(err => res.status(400).json(err));
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});