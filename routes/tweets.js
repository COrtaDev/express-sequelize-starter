const db = require('../db/models');
const { Tweet } = db;

const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const asyncHandler = handler => (req, res, next) => handler(req, res, next).catch(next)

const tweetNotFoundError = tweetId => {
    const err = new Error(`The tweet with id of ${tweetId} could not be found`);
    err.title = "Tweet Not found";
    err.status = 404;
    return err;
}


const handleValidationErrors = (req, res, next) => {

    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        return next(err);
    }
    next();
}

router.get("/", asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll();
    res.json({ tweets });
}));

router.get('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}));

router.post('/', handleValidationErrors, asyncHandler(async (req, res, next) => {
    const { message } = req.body;
    const newTweet = await Tweet.create({ message });
    res.status(201).json({ newTweet });
}))

router.put('/:id(\\d+)', handleValidationErrors, asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id);
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        const { message } = req.body
        tweet.message = message;
        await tweet.save();
        res.status(201).json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}));

module.exports = router
