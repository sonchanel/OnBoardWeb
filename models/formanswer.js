const mongoose = require('mongoose');

const FormAnswerSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answer: { type: mongoose.Schema.Types.Mixed},
    submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FormAnswer', FormAnswerSchema);