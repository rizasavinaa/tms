const express   = require('express');
const router = express.Router();
const { allUsers, userForm, saveUser } = require('../controllers/UserController');

router.get('/', allUsers);
router.get('/create', userForm);
router.post('/create', saveUser);
module.exports = router;