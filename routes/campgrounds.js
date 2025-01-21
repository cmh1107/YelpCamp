const express= require('express');
const router = express.Router();
const campgroundController = require('../controllers/campgrounds.js');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const passport = require('passport');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware.js');
const multer = require('multer');
const {storage} = require('../cloudinary/index.js');//也可以不用后面的Index，node.js会默认看index文件
// const upload = multer({dest: 'uploads/'});//这个是将图片储存在本地
const upload = multer({storage});//这个是将图片储存在cloudinary

router.route('/')
    .get(catchAsync(campgroundController.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgroundController.createCampground));

router.get('/new', isLoggedIn, campgroundController.renderNewForm);

router.route('/:id')//express中的功能，简化相同route不同verb
    .get(isLoggedIn, catchAsync(campgroundController.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgroundController.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm));

module.exports = router;//当前模块的接口