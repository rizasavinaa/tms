const express   = require('express');
const router = express.Router();
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

//load homepage
router.get('/', (req,res)=>{
    res.render('home');
});

//load menu user
router.get('/user', (req,res)=>{
    res.render('user');
});

const { allUsers, userForm, saveUser } = require('../controllers/UserController');

router.get('/', allUsers);
router.get('/create', userForm);
router.post('/create', saveUser);
module.exports = router;