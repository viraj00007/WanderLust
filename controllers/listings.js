const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!!");
        res.redirect("/listing");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};


module.exports.createListing = async (req, res, next) => {
    console.log("Inside POST /listings");
    try {
        console.log("req.body:", req.body); 
        console.log("req.file:", req.file);

        if (!req.file) throw new Error("No file uploaded");

        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,   
            })
            .send();

        if (!response.body.features.length) {
            throw new Error("Invalid location");
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        newListing.geometry = response.body.features[0].geometry;

        let savedListing = await newListing.save();
        console.log("Saved Listing:", savedListing);

        req.flash("success", "New Listing Created!!");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error in createListing:", err);
        next(err);
    }
};
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!!");
        res.redirect("/listing");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/uploads", "/uploads/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save()
    }
    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!!");
    res.redirect("/listings");
};