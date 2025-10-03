var express = require('express');
var router = express.Router();
var User = require('../models/user')
var Quytrinh = require('../models/quytrinh')
const sendMail = require('../utils/mailer');
const bcrypt = require('bcrypt');

var user = null;
async function check(req){
const id = req.cookies['id']
const password = req.cookies['password']
user = await User.findOne({_id:id});
}

async function checkUser(email) {
    const user = await User.findOne({ email });
    // console.log(user);
    return !!user;

} checkUser

router.post("/create", async (req, res) => {
    try {
        const { name,email,password, manager, group } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if(!checkUser(email)){
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "Nhân viên",
            group,
            manager,
            status: "Đang chờ",
        });
        // console.log(newUser)
        await newUser.save();

            const subject = 'Tài khoản Onboard Remoto của bạn';
            const text = `Xin chào ${name},

Tài khoản Remoto của bạn đã được tạo.

Thông tin đăng nhập:
Email: ${email}
Mật khẩu: ${password}

*Không chia sẽ bất cứ thông tin nào cho người khác !
*Đổi mật khẩu ngay sau khi đăng nhập lần đầu.

Truy cập vào hệ thống để bắt đầu làm việc nhé!

Trân trọng,
Remoto Team`;

            await sendMail(email, subject, text);

        res.status(201).json({ message: "Thành viên đã được tạo!" });
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: err.message });
    }
});

// router.post("/send-email/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const user = await User.findById(id);

//         if (!user) {
//             return res.status(404).json({ message: "Không tìm thấy thành viên" });
//         }

//         const subject = "Thông tin tài khoản của bạn tại Remoto";
//         const text = `Xin chào ${user.name},

// Tài khoản Remoto của bạn đã được khởi tạo.

// Thông tin đăng nhập:
// Email: ${user.email}
// Mật khẩu: ${user.password}

// Hãy truy cập hệ thống để bắt đầu nhé!

// Trân trọng,
// Remoto Team`;

//         await sendMail(user.email, subject, text);
//         res.status(200).json({ message: "Đã gửi email thành công!" });

//     }catch(err){
//         res.status(500).json({ error: err.message });
//     }
// });


router.put("/update/:id", async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.sendStatus(200);
});

router.delete("/delete/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});

router.get("/:id", async (req, res) => {
    await check(req)
    const thanhvien = await User.findById(req.params.id);
    res.json(thanhvien);
});

/* GET home page. */
router.get('/', async function(req, res, next) {
    await check(req)
    thanhvien = await User.find({manager:user._id})
//   console.log(thanhvien)
  
  res.render('Thanhvien', { title: 'Express', thanhvien: thanhvien,user: user});
});

module.exports = router;
