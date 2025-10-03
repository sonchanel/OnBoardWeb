var express = require('express');
var router = express.Router();
var User = require('../models/user')
var Quytrinh = require('../models/quytrinh')
var Step = require('../models/step')
var Form = require('../models/form')
var File = require('../models/file');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

var user=null;
async function check(req){
const id = req.cookies['id']
const password = req.cookies['password']
user = await User.findOne({_id:id});
}

router.post("/create", async (req, res) => {
    try {
        const { name, createdBy, group } = req.body;
        const newQuytrinh = new Quytrinh({
            name,
            group,
            status: "Sẵn sàng",
            document: 0,
            createdAt: new Date(),
            createdBy,
        });
        await newQuytrinh.save();
        res.status(201).json({ message: "Quy trình đã được tạo!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        await Step.deleteMany({ quyTrinhId:req.params.id });
        await Quytrinh.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Quy trình đã bị xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa quy trình" });
    }
});

router.get("/:id", async (req, res) => {
    await check(req);
    const quytrinh = await Quytrinh.findById(req.params.id);
    const step = await Step.find({quyTrinhId: req.params.id})
    // console.log(quytrinh)
    // console.log(user._id)
    if(!quytrinh.createdBy.equals(user._id)){
        return res.status(404).send("Có lỗi xảy ra.");
    }
    if (!quytrinh) {
        return res.status(404).send("Quy trình không tồn tại.");
    }
    res.render("ChitietQuytrinh", { process:quytrinh,user: user ,steps: step,selectedStep: step.length > 0 ? step[0] : null});
});

// GET step chi tiết theo ID, bao gồm câu hỏi nếu type là 'form'
router.get('/steps/:id', async (req, res) => {
    try {
        const step = await Step.findById(req.params.id);
        // console.log(step)

    if (!step) return res.status(404).json({ message: 'Không tìm thấy bước' });

    if (step.type === 'form') {
        const forms = await Form.find({ stepId: step._id }).sort({ formIndex: 1 });
        res.json({ step, forms });
    } else if (step.type === 'document') {
        const files = await File.find({ stepId: step._id }).sort({ createdAt: -1 });
        res.json({ step, files });
    } else {
        res.json({ step });
    }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.post('/steps/create', async (req, res) => {
    try {
        const newStep = new Step({
            quyTrinhId: req.body.quyTrinhId,
            name: req.body.name,
            type: req.body.type,
            required: req.body.required || false,
            completed: false
        });
        // console.log(newStep);
        await newStep.save();
        res.status(201).json({ message: "Bước mới đã được tạo!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo bước!", error });
    }
});

router.put('/steps/update/:id', async (req, res) => {
    try {
        const { name, content } = req.body;
        await Step.findByIdAndUpdate(req.params.id, { name, content });
        res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi cập nhật bước" });
    }
});

router.delete("/steps/delete/:id", async (req, res) => {
    try {
        const step = await Step.findById(req.params.id)
        if(step.type === "form"){
            await Form.deleteMany({ stepId: req.params.id });
        }
        await Step.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Bước đã bị xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bước" });
    }
});


//_____________________________________________________________
//FORM

// Tạo form mới
router.post('/form/create', async (req, res) => {
    try {
        const { stepId, formIndex, name, type, options, required } = req.body;

        const newForm = new Form({
            stepId,
            formIndex,
            name,
            type,
            options, // mảng các lựa chọn nếu là radio/checkbox
            required: required || false
        });

        await newForm.save();
        res.status(201).json({ message: "Form đã được tạo!", form: newForm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi tạo form!" });
    }
});

// Cập nhật form
router.put('/form/update/:id', async (req, res) => {
    try {
        const { formIndex, name, type, options, required } = req.body;
        await Form.findByIdAndUpdate(req.params.id, {
            formIndex,
            name,
            type,
            options,
            required
        });
        res.status(200).json({ message: "Cập nhật form thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi cập nhật form" });
    }
});

// Xóa form
router.delete('/form/delete/:id', async (req, res) => {
    try {
        await Form.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Form đã bị xóa" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi xóa form" });
    }
});

//_____________________________________________________________
//DOCUMENT
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const originalName = req.body.name || file.originalname;
      const timestamp = Date.now();
  
      const extension = originalName.split('.').pop();
      const baseName = originalName
        .replace(/\.[^/.]+$/, '')       // bỏ phần mở rộng
        .replace(/\s+/g, '_')           // khoảng trắng -> _
        .replace(/[^a-zA-Z0-9_-]/g, ''); // loại ký tự đặc biệt
  
      const safePublicId = `${baseName}_${timestamp}`;
        console.log(file)
      return {
        folder: 'onboard-files',
        resource_type: 'raw',
        public_id: safePublicId,
        format: extension,
      };
    },
  });
  

  const upload = multer({ storage });

  router.post('/file/upload', upload.single('file'), async (req, res) => {
    try {
        
      const { name, stepId } = req.body;
        
      if (!req.file || !stepId) {
        return res.status(400).json({ success: false, message: 'Thiếu file hoặc stepId' });
      }
  
      const originalName = req.file.originalname;
      const baseName = originalName.replace(/\.[^/.]+$/, ""); // "Ninh_Trung_Son_BT1"
  
      const fileDoc = new File({
        name: req.file.originalname, // tên gốc có dấu
        title: name,
        url: req.file.path, // link cloudinary
        public_id: req.file.filename,
        downloadUrl: req.file.path.replace('/raw/upload/', '/raw/upload/attachment=true/'),
        stepId
      });

      await fileDoc.save();
  
      res.json({ success: true, file: fileDoc });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Lỗi server khi upload file' });
    }
  });
  
  // Route xóa file
router.delete('/file/delete/:id', async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      if (!file) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
      }
  
      // Xóa file trên Cloudinary
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: 'raw' // Vì bạn upload dạng raw
      });
  
      // Xóa khỏi MongoDB
      await file.deleteOne();
  
      res.json({ success: true });
    } catch (err) {
      console.error('Lỗi khi xóa file:', err);
      res.status(500).json({ success: false, message: 'Lỗi server khi xóa file' });
    }
  });


/* GET home page. */
router.get('/', async function(req, res, next) {
    await check(req);
//   console.log(user)
  const quytrinh = await Quytrinh.find({createdBy:user._id})
//   console.log(quytrinh)
  
  res.render('Quytrinh', { title: 'Express', processes: quytrinh,user: user});
});

module.exports = router;
