var express = require('express');
var router = express.Router();
var User = require('../models/user')
var Quytrinh = require('../models/quytrinh')
const sendMail = require('../utils/mailer');
const bcrypt = require('bcrypt');
const multer = require('multer');
const XLSX = require('xlsx');

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

router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
    await check(req)
    const thanhvien = await User.findById(req.params.id);
    res.json(thanhvien);
});

/* GET home page. */
router.get('/', async function(req, res, next) {
    await check(req)
    const { q, group } = req.query;

    const baseFilter = { manager: user._id };
    const andConditions = [baseFilter];

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

    const filter = andConditions.length > 1 ? { $and: andConditions } : baseFilter;

    const thanhvien = await User.find(filter);
    const groups = await User.distinct('group', { manager: user._id });

    res.render('Thanhvien', {
        title: 'Express',
        thanhvien: thanhvien,
        user: user,
        groups: groups,
        q: q || '',
        selectedGroup: group || 'all'
    });
});

module.exports = router;

// Bulk import nhân viên từ Excel/CSV (dành cho Quản lý)
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// Tải file template (xlsx)
router.get('/bulk-template', async (req, res) => {
    const wb = XLSX.utils.book_new();
    const data = [
        { name: 'Nguyen Van A', email: 'nva@example.com', password: 'Abcd1234', group: 'Team A' }
    ];
    const ws = XLSX.utils.json_to_sheet(data, { header: ['name', 'email', 'password', 'group'] });
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="template_import_nhanvien.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
});

router.post('/bulk-import', upload.single('file'), async (req, res) => {
    try {
        await check(req)
        if (!req.file) {
            return res.status(400).json({ error: 'Vui lòng upload file Excel/CSV' });
        }
        const sendEmail = String(req.body.sendEmail || '').toLowerCase() === 'true';
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        const toCreate = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = i + 2;
            const name = String(row.name || '').trim();
            const email = String(row.email || '').trim();
            const passwordRaw = String(row.password || '').trim();
            const group = String(row.group || '').trim();

            if (!name || !email || !group) {
                errors.push({ row: rowIndex, error: 'Thiếu name/email/group' });
                continue;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push({ row: rowIndex, error: 'Email không hợp lệ' });
                continue;
            }
            const password = passwordRaw || Math.random().toString(36).slice(-10) + 'A1';
            const existed = await User.findOne({ email });
            if (existed) {
                errors.push({ row: rowIndex, error: 'Email đã tồn tại trong hệ thống' });
                continue;
            }
            toCreate.push({ name, email, password, group });
        }

        const created = [];
        for (const u of toCreate) {
            const plainPassword = u.password;
            const hashed = await bcrypt.hash(plainPassword, 10);
            const newUser = new User({
                name: u.name,
                email: u.email,
                password: hashed,
                role: 'Nhân viên',
                group: u.group,
                manager: user._id,
                status: 'Đang chờ'
            });
            await newUser.save();
            created.push({ email: u.email, name: u.name, password: plainPassword });
        }

        if (sendEmail && created.length) {
            for (const c of created) {
                try {
                    const subject = 'Tài khoản Onboard Remoto của bạn';
                    const text = `Xin chào ${c.name},\n\nTài khoản Remoto của bạn đã được tạo.\n\nThông tin đăng nhập:\nEmail: ${c.email}\nMật khẩu: ${c.password}\n\n*Không chia sẻ thông tin cho người khác!\n*Đổi mật khẩu ngay sau khi đăng nhập lần đầu.\n\nTrân trọng,\nRemoto Team`;
                    await sendMail(c.email, subject, text);
                } catch (e) {
                    errors.push({ row: '-', error: `Gửi email thất bại cho ${c.email}` });
                }
            }
        }

        res.json({
            summary: { totalRows: rows.length, createdCount: created.length, errorCount: errors.length },
            errors,
            created
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi xử lý file' });
    }
});
