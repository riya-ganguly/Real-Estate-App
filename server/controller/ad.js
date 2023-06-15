import { nanoid } from "nanoid";
import * as config from "../config.js"
import slugify from "slugify";
import Ad from '../models/ad.js';
import User from '../models/user.js';
import { emailTemplate } from "../helpers/email.js";

export const uploadImage = async (req, res) => {
    try{
        // console.log(req.body);
        const {image} = req.body;

        const base64Image = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 
        "base64"
        );
        const type = image.split(";")[0].split("/")[1];

        //image params
        const params = {
            Bucket: "realist-app-riya-practice",
            Key: `${nanoid()}.${type}`,
            Body: base64Image,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: `image/${type}`,
        };
        config.AWSS3.upload(params, (err, data)=>{
            if(err){
                console.log(err);
                res.sendStatus(400);
            }
            else{
                // console.log(data);
                res.send(data);

            }
        });
    }
    catch(err){
        console.log(err);
        return res.json({error: "Upload Failed. Try Again"});
    }
}

export const removeImage = (req, res) => {
    try{
        const {Key, Bucket} = req.body;

        config.AWSS3.deleteObject({Bucket, Key}, (err, data) => {
            if(err){
                console.log(err);
                res.sendStatus(400);
            }
            else{
                res.send({ok: true});
            }
        });
    }
    catch(err){
        console.log(err);
    }
}

export const create = async (req, res) => {
    try{
        //console.log(req.body);
        const {photos, description, price, title, address, type, landsize} = 
        req.body;
        if(!photos.length){
            return res.json({error : "Photos are required"});
        }
        if(!price){
            return res.json({error : "Price is required"});
        }
        if(!type){
            return res.json({error : "Is property house or land"});
        }
        if(!address){
            return res.json({error : "Address is required"});
        }
        if(!description){
            return res.json({error : "Description is required"});
        }
        
        const geo = await config.GOOGLE_GEOCODER.geocode(address);
        // console.log("geo => ", geo);

        const ad = await new Ad({
            ...req.body,
            postedBy: req.user._id,
            location: {
                type: 'Point',
                coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
            },
            googleMap: geo,
            slug: slugify(`${type}-${address}-${price}-${nanoid(6)}`), 
        });
        ad.save();

        //make user seller after ad creation

        const user = await User.findByIdAndUpdate(req.user._id, 
        {
            $addToSet: { role: "Seller"},
        },
        {
            new: true
        }
        );

        user.password = undefined;
        user.resetCode = undefined;

        return res.json({
            ad, 
            user,
        });
    }
    catch(err) {
        console.log(err);
        res.json({error: "Something went wrong. Try again."});
    }
};

export const ads = async (req, res) => {
    try{
        const adsForSell = await Ad.find({action: "Sell"})
            .select('-googleMap -location -photos.key -photos.Key -photos.Etag')
            .sort({createdAt: -1})
            .limit(12);

        const adsForRent = await Ad.find({action: "Rent"})
        .select('-googleMap -location -photos.key -photos.Key -photos.Etag')
        .sort({createdAt: -1})
        .limit(12);

        res.json({adsForSell, adsForRent});
    }   
    catch(err){
       console.log(err); 
    }
};

export const read = async (req, res) => {
    try{
        const ad = await Ad.findOne({slug: req.params.slug}).populate(
            'postedBy',
            'name username email phone comapny photo.Location'
        );
        // console.log(ad);

        //related
        const related = await Ad.find ({
            _id: {$ne: ad._id},
            action: ad.action,
            type: ad.type,
            address: {
                $regex: ad.googleMap[0]?.administrativeLevels?.level1long || "",
                $options: "i",
            }
        }).limit(3).select('-photos.Key -photos.key -photos.Etag -photos.Bucket -googleMap');

        res.json({ad, related});
    }
    catch(err){
        console.log(err);
    }
};

export const addToWishlist = async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {wishlist: req.body.adId},
        }, 
        {new: true});

        const {password, resetCode, ...rest} = user._doc;
        res.json(rest);
    }
    catch(err){
        console.log(err);
    }
};

export const removeFromWishlist = async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(req.user._id, {
            $pull: {wishlist: req.params.adId},
        }, 
        {new: true});

        const {password, resetCode, ...rest} = user._doc;
        res.json(rest);
    }
    catch(err){
        console.log(err);
    }
};

export const contactSeller = async (req, res) => {
    try{
        const {name, email, message, phone, adId} = req.body;
        // console.log(req.body);
        const ad = await Ad.findById(adId).populate('postedBy', "email");

        const user = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {enquiredproperties: adId},
        });

        if(!user){
            return res.JSON({error : "Could not find user with that email"});
        } 
        else {
            config.AWSSES.sendEmail(emailTemplate(
                ad.postedBy.email, 
                `
                  <p>You have receievd a new customer enquiry.</p>
                    <h4> Customer Details </h4>
                    <p>Name: ${name} </p>
                    <p>Email: ${email} </p>
                    <p>Phone: ${phone} </p>
                    <p>Message: ${message} </p>

                  <a href="${config.CLIENT_URL}/ad/${ad.slug}"> ${ad.type} in ${ad.address} for ${ad.action} ${ad.price}</a>
                `,
                email, 
                "New Enquiry Received"
               ), 
               (err, data) => {
                  if (err){
                      console.log(err);
                      return res.json({ok : false});
                  }
                  else{
                      console.log(data);
                      return res.json({ok : true});
                  }
      
              })
        }

    }
    catch(err){
        console.log(err);
    }
};

export const userAds = async (req, res) => {
    try {
        const perPage = 2;        
        const page = req.params.page ? req.params.page : 1;

        const total = await Ad.find({postedBy: req.user._id});

        const ads = await Ad.find({postedBy: req.user._id})
            .select('-photos.Key -photos.key -photos.ETag -photos.Bucket -location -googleMap')
            .populate('postedBy', 'name email username phone company')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({createdAt: -1});

            res.json({ads, total: total.length});
    } catch (err) {
        console.log(err);
    }
};

export const update = async (req, res) => {
    try {
        const {photos, price, type, address, description} = req.body;
        
        const ad = await Ad.findById(req.params._id);

        const  owner = req.user._id == ad?.postedBy;

        if(!owner){
            return res.json({error : "Permission denied"});            
        }
        else {
            if(!photos.length) {
                return res.json({error: "Photos are required"});
            }
            if(!price) {
                return res.json({error: "Price are required"});
            }
            if(!type) {
                return res.json({error: "Is property House or Land"});
            }
            if(!address) {
                return res.json({error: "Address is required"});
            }
            if(!description) {
                return res.json({error: "Description if required"});
            }

            const geo = await config.GOOGLE_GEOCODER.geocode(address);

            await ad.updateOne({
                ...req.body,
                slug: ad.slug,
                location: {
                    type: "Point",
                    coordinates: [geo?.[0].longitude, geo?.[0].latitude],
                }
            });

            res.json({ok: true});
        }
    } catch (err) {
        console.log(err);
    }
};

export const enquiredProperties = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const ads = await Ad.find({_id: user.enquiredproperties}).sort({
            createdAt: -1,
        });
        res.json(ads);
    } catch (err) {
        console.log(err);
    }
};

export const wishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const ads = await Ad.find({_id: user.wishlist}).sort({
            createdAt: -1,
        });
        res.json(ads);
    } catch (err) {
        console.log(err);
    }
};

export const remove = async (req, res) => {
    try {

        const ad = await Ad.findById(req.params._id);
        const  owner = req.user._id == ad?.postedBy;

        if(!owner) {
            return res.json({error : "permission denied"});
        } else {
            await Ad.findByIdAndRemove(ad._id);
            res.json({ok : true});
        }

    } catch (err) {
        console.log(err);
    }
}

export const adsForSell = async (req, res) => {
    try{
        const ads = await Ad.find({action: "Sell"})
            .select('-googleMap -location -photos.key -photos.Key -photos.Etag')
            .sort({createdAt: -1})
            .limit(24);

        res.json(ads);
    }   
    catch(err){
       console.log(err); 
    }
};

export const adsForRent = async (req, res) => {
    try{
    
        const ads = await Ad.find({action: "Rent"})
        .select('-googleMap -location -photos.key -photos.Key -photos.Etag')
        .sort({createdAt: -1})
        .limit(24);

        res.json(ads);
    }   
    catch(err){
       console.log(err); 
    }
};

export const search = async (req, res) => {
    try{
        // console.log(req.query);
        const {action, address, type, priceRange} = req.query;
        const geo = await config.GOOGLE_GEOCODER.geocode(address);
        console.log(geo)
        const ads = await Ad
            .find({
                action : action === "Buy" ? "Sell" : "Rent",
                type,
                price: {
                    $gte : parseInt(priceRange[0]),
                    $lte : parseInt(priceRange[1]),
                },
                location: {
                    $near: {
                        $maxDistance: 50000, //in metres
                        $geometry : {
                            type: "Point",
                            coordinates : [geo?.[0].longitude, geo?.[0].latitude],
                        },
                    },
                },
            })
            .limit(24)
            .sort({createdAt: -1})
            .select(
                '-photos.key -photos.Key -photos.ETag -photos.Bucket -location -googleMap'
            );
            res.json(ads);
    }
    catch (err) {
        console.log(err);
    }
}

