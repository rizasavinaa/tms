import User from "../models/UserModel.js";
import argon2 from "argon2";
import RolePrivilege from "../models/RolePrivilegeModel.js";
import UserLog from "../models/UserLogModel.js";
import requestIp from "request-ip";
import Talent from "../models/TalentModel.js"
import Client from "../models/ClientModel.js";

export const Login = async (req, res) => {
    const user = await User.scope(null).findOne({
        where: { email: req.body.email }
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    // ❌ Cek apakah user nonaktif
    if (user.status === 0) {
        return res.status(403).json({ msg: "Akun Anda berstatus nonaktif" });
    }

    const match = await argon2.verify(user.password, req.body.password);
    if (!match) return res.status(400).json({ msg: "Password Salah" });

    // 🔥 Simpan IP dan last_login
    await User.update({
        last_login: new Date(),
        last_ip: req.ip  // 🚀 Simpan IP login
    }, { where: { id: user.id } });

    req.session.userId = user.id;
    req.session.roleId = user.role_id;
    req.session.fullname = user.fullname;
    req.session.createdAt = Date.now();
    req.session.talent_id = 0;
    req.session.client_id = 0;
    if (user.role_id === 3) {
        const talent = await Talent.findOne({
            where: { user_id: user.id }
        });

        if (talent) {
            req.session.talent_id = talent.id;
        }
    }else if (user.role_id === 4) {
        const client = await Client.findOne({
            where: { user_id: user.id }
        });

        if (client) {
            req.session.client_id = client.id;
        }
    }
    req.session.save(() => {
        console.log("Session setelah login:", req.session); // Cek session setelah disimpan
        res.status(200).json({
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role_id: user.role_id,
            talent_id: req.session.talent_id,
            client_id: req.session.client_id
        });
    });

    // 🔹 Simpan log login
    await UserLog.create({
        user_id: user.id,
        changes: "Login",
        ip: requestIp.getClientIp(req), // Ambil IP user
        createdby: user.id,
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

    return res.status(200).json({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role_id: user.role_id,
        talent_id: req.session.talent_id, // ⬅️ Tambahkan ini!
        client_id: req.session.client_id,
    });
}


export const logOut = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: "Anda belum login" });
        }

        // 🔹 Simpan log logout ke database
        await UserLog.create({
            user_id: userId,
            changes: "Logout",
            ip: requestIp.getClientIp(req),
            createdby: userId,
        });

        // 🔹 Hapus sesi
        req.session.destroy((err) => {
            if (err) {
                return res.status(400).json({ message: "Tidak dapat logout" });
            }
            res.status(200).json({ message: "Anda telah logout" });
        });

    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
    }
};


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