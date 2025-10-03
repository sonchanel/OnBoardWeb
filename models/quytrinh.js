var mongoose = require('mongoose');

const quytrinhSchema = new mongoose.Schema({
    name: String,
    manager: String,
    group: String,
    status: String,
    document: Number,
    createdAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {timestamps: true, versionKey: false})

module.exports = mongoose.model("Quytrinh",quytrinhSchema);