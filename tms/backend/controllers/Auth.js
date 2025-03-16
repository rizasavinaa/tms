import User from "../models/UserModel.js";
import argon2 from "argon2";
import Privilege from "../models/PrivilegeModel.js"; 
import RolePrivilege from "../models/RolePrivilegeModel.js"; 

export const Login = async (req, res) => {
    const user = await User.scope(null).findOne({
        where: { email: req.body.email }
    });
    
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const match = await argon2.verify(user.password, req.body.password);
    if (!match) return res.status(400).json({ msg: "Password Salah" });

    req.session.userId = user.id;
    req.session.roleId = user.role_id;
    req.session.fullname = user.fullname;
    req.session.createdAt = Date.now();
    req.session.save(() => {
        console.log("Session setelah login:", req.session); // Cek session setelah disimpan
        res.status(200).json({
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role_id: user.role_id
        });
    });
};


export const Me = async (req, res) => {
    if (!req.session.userId) {
        if (req.session.createdAt) {
            return res.status(401).json({ msg: "Session telah berakhir, silakan login kembali!" });
        }
        return res.status(401).json({ msg: "" }); // User baru pertama kali akses
    }

    const user = await User.findOne({
        attributes: ["id", "fullname", "email", "role_id"],
        where: { id: req.session.userId }
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    res.status(200).json(user);
};


export const logOut = (req, res) =>{
    req.session.destroy((err)=>{
        if(err) return res.status(400).json({msg: "Tidak dapat logout"});
        res.status(200).json({msg: "Anda telah logout"});
    });
}


export const checkPrivilege = async (req, res) => {
    const { privilege_id } = req.params; // ID halaman dari frontend
    if (!req.session.userId) {
        return res.status(401).json({ msg: "Mohon login terlebih dahulu" });
    }

    try {
        const hasAccess = await RolePrivilege.findOne({
            where: { 
                role_id: req.session.roleId,
                privilege_id: privilege_id
            }
        });

        if (!hasAccess) {
            return res.status(403).json({ msg: "Anda tidak memiliki hak akses ke halaman ini" });
        }

        res.status(200).json({ access: true, msg: "Akses diizinkan" });

    } catch (error) {
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};