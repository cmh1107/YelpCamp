const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');//mapbox的api：geocoding  
const mapboxToken = process.env.MAPBOX_TOKEN;//mapbox连接的token
const geocoder = mbxGeocoding({accessToken: mapboxToken});//连接geo



module.exports.index = async(req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};

module.exports.renderNewForm = (req, res) =>{
    res.render('campgrounds/new');
};

module.exports.createCampground = async(req, res) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data');
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geodata.body.features[0].geometry//获取经纬度，geometry的格式是geojson
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));//上传图片
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'successfully make a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews', populate: {path: 'author'}}).populate('author');
    if (!campground) {
        req.flash('error', 'can not find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
};

module.exports.renderEditForm = async(req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'can not find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
};

module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, {new: true});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);//...imgs不是push一整个array，而是将里面的数据push上去
    await campground.save();
    if (req.body.deleteImages) {//删除图片
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);//删掉cloudinary云端的图片
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'successfully update a campground!')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success','successfully delete a campground!')
    res.redirect('/campgrounds');
};