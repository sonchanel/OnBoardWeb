var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Quytrinh = require('../models/quytrinh');
var User_QuyTrinh = require('../models/user_quytrinh')
var Form = require('../models/form');
var FormAnswer = require('../models/formanswer');
var XLSX = require('xlsx');

var user = null;
async function check(req){
const id = req.cookies['id']
const password = req.cookies['password']
user = await User.findOne({_id:id});
}

var checkUser = async function(req, res, next){
  console.log("1")
  const email = req.cookies['email']
  const password = req.cookies['password']
  if(!email||!password){
    console.log("2")
    res.redirect('/Dangnhap')
  }
  else{
    user = await User.findOne({email:email});
    // console.log(user + password)
    if(password === user.password){
      console.log("4")
      return next()
    }else{
      res.redirect('/Dangnhap')
    }
  }
}

router.post("/assign-process/:id", async (req, res) => {
    try {
        const idUser = req.params.id;
        const { processId } = req.body;
        const idQuytrinh = processId;
        // console.log(idUser, idQuytrinh)
        const Check = await User_QuyTrinh.findOne({
          userId: idUser,
          quyTrinhId: idQuytrinh
        });
        if (Check) {
          res.json({ message: "User đã được thêm quy trình này" });
        } else {
        await User_QuyTrinh.findOneAndDelete({ userId: idUser });
        const newUser_Quytrinh = new User_QuyTrinh({
            userId: idUser,
            quyTrinhId: idQuytrinh,
            step : 0
        });
        await newUser_Quytrinh.save();
        res.status(201).json({ success: true, message: "Quy trình đã được tạo!" });
      }
    } catch (err) {
        res.status(500).json({ error: err.messsage });
    }
});

// Bulk assign a process to all users in a specific group (under current manager)
router.post('/assign-process-group', async (req, res) => {
  try {
    await check(req);
    const { group, processId } = req.body;
    if (!group || !processId) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số nhóm hoặc quy trình' });
    }

    // Find all users in the group managed by current user
    const usersInGroup = await User.find({ manager: user._id, group: group }).select('_id');
    if (!usersInGroup.length) {
      return res.status(200).json({ success: true, message: 'Không có nhân viên trong nhóm này' });
    }

    const userIds = usersInGroup.map(u => u._id);

    // Remove existing assignment for these users to ensure one active process per user (following single-assignment logic above)
    await User_QuyTrinh.deleteMany({ userId: { $in: userIds } });

    // Prepare bulk inserts, skipping users already assigned to the same process (defensive double-check)
    const existing = await User_QuyTrinh.find({ userId: { $in: userIds }, quyTrinhId: processId }).select('userId');
    const existingIds = new Set(existing.map(e => String(e.userId)));

    const docs = userIds
      .filter(id => !existingIds.has(String(id)))
      .map(id => ({ userId: id, quyTrinhId: processId, step: 0 }));

    if (docs.length) {
      await User_QuyTrinh.insertMany(docs);
    }

    return res.status(201).json({ success: true, message: `Đã gán quy trình cho ${docs.length}/${userIds.length} nhân viên trong nhóm ${group}` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Export Excel: tổng hợp câu trả lời form của 1 nhóm nhân viên (dưới quyền manager hiện tại)
router.get('/export-form-answers', async (req, res) => {
  try {
    await check(req);
    const group = req.query.group;
    if (!group) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số nhóm' });
    }

    const users = await User.find({ manager: user._id, group: group }).select('_id name email group');
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'Không có nhân viên trong nhóm này' });
    }

    const userIdToUser = new Map(users.map(u => [String(u._id), u]));
    const userIds = users.map(u => u._id);

    const answers = await FormAnswer.find({ userId: { $in: userIds } })
      .populate('formId', 'name type')
      .lean();

    // Tạo dữ liệu cho Excel
    const rows = answers.map(a => {
      const infoUser = userIdToUser.get(String(a.userId));
      const formName = a.formId && a.formId.name ? a.formId.name : '';
      let value = a.answer;
      if (Array.isArray(value)) {
        value = value.join(', ');
      } else if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      } else if (value === undefined || value === null) {
        value = '';
      } else {
        value = String(value);
      }
      return {
        'Nhóm': infoUser ? infoUser.group : '',
        'Họ tên': infoUser ? infoUser.name : '',
        'Email': infoUser ? infoUser.email : '',
        'Câu hỏi': formName,
        'Câu trả lời': value,
        'Thời gian nộp': a.submittedAt ? new Date(a.submittedAt).toLocaleString('vi-VN') : ''
      };
    });

    // Nếu không có câu trả lời, vẫn xuất file với header
    if (!rows.length) {
      rows.push({ 'Nhóm': group, 'Họ tên': '', 'Email': '', 'Câu hỏi': '', 'Câu trả lời': '', 'Thời gian nộp': '' });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'FormAnswers');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    const fileName = `form-answers-${group}-${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  await check(req)
  // console.log(user)
  const processes = await Quytrinh.find({createdBy:user._id})

  const { q, group } = req.query;

  const baseMatch = { manager: user._id };
  const andConditions = [baseMatch];

  if (q && q.trim() !== "") {
    const keyword = q.trim();
    andConditions.push({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ]
    });
  }

  if (group && group !== 'all') {
    andConditions.push({ group: group });
  }

  const matchStage = andConditions.length > 1 ? { $and: andConditions } : baseMatch;

  const data = await User.aggregate([
    { $match: matchStage }, // Lọc danh sách nhân viên theo điều kiện
    {
        $lookup: {
            from: "user_quytrinhs",  // Ghép với bảng liên kết User_QuyTrinh
            localField: "_id",       
            foreignField: "userId",  
            as: "userProcesses"      
        }
    },
    {
        $unwind: { path: "$userProcesses", preserveNullAndEmptyArrays: true } // Giải nén dữ liệu
    },
    {
        $lookup: {
            from: "quytrinhs",  // Ghép tiếp với bảng QuyTrinh
            localField: "userProcesses.quyTrinhId",
            foreignField: "_id",
            as: "processInfo"
        }
    },
    {
        $unwind: { path: "$processInfo", preserveNullAndEmptyArrays: true }
    },
    {
        $group: {
            _id: "$_id",
            name: { $first: "$name" },
            email: { $first: "$email" },
            manager: { $first: "$manager" },
            group: { $first: "$group" },
            time: { $first: "$time" },
            status: { $first: "$status" },
            quyTrinhId: { $push: "$processInfo._id" }, // Đổi thành mảng
            quyTrinhName: { $push: "$processInfo.name" },       // Đổi thành mảng
            updatedAt: { $max: "$userProcesses.updatedAt" }
        }
    },
    { $sort: { "updatedAt": 1 } }
]);
  const groups = await User.distinct('group', { manager: user._id });
  res.render('index', {
    title: 'Express',
    data: data,
    user: user,
    processes: processes,
    groups: groups,
    q: q || '',
    selectedGroup: group || 'all'
  });
});

module.exports = router;
