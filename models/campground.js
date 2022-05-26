const mongoose = require('mongoose');

// Define a schema
let Schema = mongoose.Schema;
let campgroundSchema = new Schema({
    name: String,
    image: String,
    price:String,
    description: String,
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});
// Compile model from schema
module.exports = mongoose.model('Campground', campgroundSchema);