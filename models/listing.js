const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://images.freeimages.com/images/large-previews/24d/serene-mountain-lake-0410-5702987.jpg",
        set: (v) => (v === "" ? "https://images.freeimages.com/images/large-previews/24d/serene-mountain-lake-0410-5702987.jpg" : v)
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});


listingSchema.post("findOneDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;