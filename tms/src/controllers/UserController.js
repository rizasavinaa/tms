const User = require('../models/User');

const allUsers = async (req,res)=>{
    await res.render('home');
}
const userForm = async (req,res)=>{
    await res.render('create');
}

const saveUser = async (req, res)=>{
    const {fullname, email, password} = await req.body;
    const user = await User.create({
        fullname, email, password
    }).catch(error=>console.log(error));
    console.log(user);
    await res.render('create');
}
module.exports = {
    allUsers,userForm,saveUser
}