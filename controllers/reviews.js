const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    //我们在show page的时候给了form的不同元素名字，比如review[body]\review[rating]，这个在parse的时候under the key of review.
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'created a new review!')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});//删掉campground里的review id
    await Review.findByIdAndDelete(reviewId);//删掉review库里的rerivew
    req.flash('success','successfully delete a review!')
    res.redirect(`/campgrounds/${id}`);
};