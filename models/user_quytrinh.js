var mongoose = require('mongoose');

const user_quytrinhSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quyTrinhId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quytrinh', required: true },
    step: Number,
}, {timestamps: true, versionKey: false})

module.exports = mongoose.model("User_QuyTrinh",user_quytrinhSchema);