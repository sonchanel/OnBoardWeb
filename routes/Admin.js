var express = require('express');
var router = express.Router();
var User = require('../models/user');
const bcrypt = require('bcrypt');

var user = null;
async function check(req){
const id = req.cookies['id']
const password = req.cookies['password']
user = await User.findOne({_id:id});
}

// Danh sách tài khoản Quản lý
router.get('/', async function(req, res, next) {
    await check(req)
    const { q } = req.query;
    const andConditions = [{ role: "Quản lý" }];

    if (q && q.trim() !== "") {
        const keyword = q.trim();
        andConditions.push({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        });
    }

    const filter = andConditions.length > 1 ? { $and: andConditions } : { role: "Quản lý" };
    const managers = await User.find(filter).sort({ createdAt: -1 });

    res.render('Admin', { title: 'Admin', user: user, managers: managers, q: q || '' });
});

// Lấy 1 quản lý
router.get('/:id', async (req, res) => {
    const manager = await User.findById(req.params.id);
    res.json(manager);
});

// Tạo tài khoản quản lý
router.post('/create', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existed = await User.findOne({ email });
        if (existed) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'Quản lý',
            status: 'Đang chờ'
        });
        await newUser.save();
        res.status(201).json({ message: 'Tạo tài khoản quản lý thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật quản lý
router.put('/update/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.sendStatus(200);
});

// Xóa quản lý
router.delete('/delete/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});

module.exports = router;


