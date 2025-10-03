var mongoose = require('mongoose');

const connectDB = async (uri) => {
    try {
        mongoose.connect(uri)
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB;