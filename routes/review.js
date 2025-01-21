const express= require('express');
const router = express.Router({mergeParams: true});//这样我们能access router前缀中的params了
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');

router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync (reviewController.deleteReview));

module.exports = router;