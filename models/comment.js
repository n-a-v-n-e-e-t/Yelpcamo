const mongoose = require('mongoose');
// Define a schema
let Schema = mongoose.Schema;
let commentSchema = new Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});
// Compile model from schema
module.exports = mongoose.model('Comment', commentSchema);