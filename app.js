if (process.env.Node_env !== 'production') {
    require('dotenv').config();
}

//require some library and moedels
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');//渲染视图模版
const path = require('path');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/users');

const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');



//connect to mongo database
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log("mongo sucessfully connected")
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

//configuration
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret:'thisshouldbeasecret',
    resave: false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//一个星期后过期
        maxAge: 1000 * 60 * 60 * 24 * 7//最长保留时间
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());//check document of passport.js, 要after use of session
passport.use(new passportLocal(User.authenticate()));
//这个是在告诉passport我们要用local这种方法，这个方法中有authenticate，我们要应用于user这个model上
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/campgrounds', campgroundRoutes);//router
app.use('/campgrounds/:id/reviews', reviewRoutes);
//router//但我们不能access这个id在review routes中，用mergeParams来解决
app.use('/',userRoutes);

app.use(express.static(path.join(__dirname, 'public')));//public js, css..静态文件





// app.get('/fakeuser', async (req, res) => {
//     const user = new User({email: 'colttt@gmail.com', username: 'cott'});
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })



app.get('/',(req, res)=>{
    res.render('home');
})



app.all('*', (req, res, next) => {
    next(new ExpressError('page not found',404));
})

app.use((err, req, res, next)=> {
    const{statusCode = 500} = err;
    if(!err.message) err.message = 'oh no sth went wrong!'
    res.status(statusCode).render('error', {err});
})


app.listen(3000, ()=>{
    console.log('serving on port 3000')
})