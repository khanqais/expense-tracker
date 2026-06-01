const express = require('express');
const router = express.Router();
const {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense
} = require('../controllers/ExpenseControl');
const { authUser } = require('../middleware/auth');


router.use(authUser);

router.route('/')
    .post(createExpense)
    .get(getExpenses);

router.route('/:id')
    .get(getExpense)
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;
