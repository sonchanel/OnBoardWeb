var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    group: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    time: Date,
    document: Number,
    phone: String,
    address: String,
}, {timestamps: true, versionKey: false})

module.exports = mongoose.model("User",userSchema);