const Expense = require('../models/Expense');

const createExpense = async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;
        const expense = await Expense.create({
            title,
            amount,
            category,
            date,
            createdBy: req.body.userId // from auth middleware
        });
        res.status(201).json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ createdBy: req.body.userId }).sort({ date: -1 });
        res.status(200).json({ success: true, count: expenses.length, expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            createdBy: req.body.userId
        });
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.status(200).json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.body.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.status(200).json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.body.userId
        });
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense
};
