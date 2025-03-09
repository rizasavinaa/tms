const express   = require('express');
const router = express.Router();
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

//load homepage
router.get('/', (req,res)=>{
    res.render('home');
});

//load homepage it
router.get('/it', (req,res)=>{
    res.render('it');
});

//load homepage karyawan
router.get('/karyawan', (req,res)=>{
    res.render('karyawan');
});

//load homepage pekerja kreatif
router.get('/pekerjakreatif', (req,res)=>{
    res.render('pekerjakreatif');
});

//load homepage client
router.get('/client', (req,res)=>{
    res.render('client');
});

//load homepage payroll
router.get('/payroll', (req,res)=>{
    res.render('payroll');
});

const { allUsers, userForm, saveUser } = require('../controllers/UserController');

router.get('/', allUsers);
router.get('/create', userForm);
router.post('/create', saveUser);
module.exports = router;