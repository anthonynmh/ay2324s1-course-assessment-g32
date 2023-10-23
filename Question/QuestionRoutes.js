const express = require('express');
const router = express.Router();

const questionController = require('./QuestionController.js');
const middleware = require('./helpers/middleware.js');

// Only maintainer can access these routes
router.post('/create', middleware.checkTokenMaintainer, questionController.create);
router.post('/edit', middleware.checkTokenMaintainer, questionController.edit);
router.delete('/delete', middleware.checkTokenMaintainer, questionController.deleteQuestion);

// User and maintainer can access the remaining routes
router.get('/getAll', middleware.checkToken, questionController.getAll);
router.get('/getQuestionDetails', middleware.checkToken, questionController.getQuestionDetails);
router.post('/appendQuestionTitle', middleware.checkToken, questionController.appendQuestionTitle);

module.exports = router;
