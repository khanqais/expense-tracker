const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide expense title'],
        trim: true,
        maxlength: 100,
    },
    amount: {
        type: Number,
        required: [true, 'Please provide expense amount'],
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Other'],
        default: 'Other'
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
