import { ObjectId } from "mongodb";
import {model, Schema} from "mongoose";

const schema = new Schema({
    
    photos: [{}],
    price: {type: Number, maxLength: 255},
    address: {type: String, maxLength: 255, required: true},
    bedrooms: Number,
    bathrooms: Number,
    landsize: String,
    carparks: Number,
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [75.341217, 31.147129]
        },
   },
   title: {
    type: String,
    maxLength: 255,
   }, 
   slug: {
    type: String,
    lowercase: true,
    unique: true,
   },
   description: {},
   postedBy: {type: ObjectId, ref: "User"},
   sold:{
    type: Boolean,
    default: false,
   },
   googleMap: {},
   type: {
    type: String,
    default: "Other",
   },
   action: {
    type: String,
    default: "Sell",
   },
   views: {
    type: Number,
    default: 0,
   },
},
{timestamps: true}//it will be created and updated automatically
)

schema.index({location: "2dsphere"});
export default model('Ad', schema);