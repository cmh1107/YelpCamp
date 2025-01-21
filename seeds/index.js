const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const{places, descriptors} = require('./seedHelpers');


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
 
const db = mongoose.connection;
 
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i< 200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20) +10;
        const camp = new Campground({
            author: '6786bbf4d68748669d358389',//your user id
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images:[ {url:`https://picsum.photos/400?random=${Math.random()}`,
                    filename: 'picture1'},
                    {url: `https://picsum.photos/400?random=${Math.random() + 1}`,
                    filename: 'picture2'}],
            description:'Lorem ipsum dolor sit, amet consectetur adipisicing elit.',
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
            ]}
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

