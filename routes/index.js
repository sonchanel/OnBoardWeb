var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Quytrinh = require('../models/quytrinh');
var User_QuyTrinh = require('../models/user_quytrinh')

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

/* GET home page. */
router.get('/', async function(req, res, next) {
  await check(req)
  // console.log(user)
  const processes = await Quytrinh.find({createdBy:user._id})
  const data = await User.aggregate([
    { $match: { manager: user._id } }, // Lọc danh sách nhân viên theo manager
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
// console.log(data)
// console.log(processes)
  res.render('index', { title: 'Express', data: data ,user: user , processes: processes});
});

module.exports = router;
