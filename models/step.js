const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
    quyTrinhId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuyTrinh', required: true }, // Liên kết với QuyTrinh
    name: { type: String, required: true },
    type: { type: String, enum: ['text', 'form', 'document', 'confirmation'], required: true },
    content: { type: String },
    required: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Step', StepSchema);