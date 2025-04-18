const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');


const MONGO_URl = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log('connected to DB');
}).catch(err => {
    console.error(err);
});

async function main() {
    await mongoose.connect(MONGO_URl);
}


const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6800250de84dd58afe4ae36a" }));
    await Listing.insertMany(initData.data);
    console.log("Data was inserted");
};
initDB();