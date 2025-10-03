const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true }, // tên gốc của file
  url: { type: String, required: true }, // URL trên Cloudinary
  downloadUrl: { type: String },
  public_id: { type: String, required: true }, // ID trên Cloudinary để xóa
  type: { type: String }, // loại file (image, pdf, docx, v.v.)
  title: { type: String },
  description: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // người tải lên
  stepId: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' }, // nếu gắn với bước nào
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
