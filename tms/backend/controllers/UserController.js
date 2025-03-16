import User from "../models/UserModel.js";
import UserLog from "../models/UserLogModel.js";
import argon2 from "argon2";

export const getUsers = async(req, res) =>{
    try {
        const response = await User.findAll(
        // {
        //     attributes: ['id', 'fullname','email','role_id','status']
        // }
        );
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const getUserById = async(req, res) =>{
    try {
        const response = await User.findOne({
            // attributes: ['id', 'fullname','email','role_id','status'],
            where:{
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const createUser = async (req, res) => {
    const transaction = await Sequelize.transaction(); // Mulai transaksi
  
    try {
      const createdBy = req.session.userId; // Ambil ID user dari session
      if (!createdBy) {
        return res.status(401).json({ message: "Unauthorized: No user session" });
      }
  
      // 1️⃣ Ambil data dari req.body, tambahkan createdBy
      const userData = { ...req.body, createdBy };
  
      // 2️⃣ Buat user baru di database
      const newUser = await User.create(userData, { transaction });
  
      // 3️⃣ Buat log dengan `changes`
      await UserLog.create({
        userId: newUser.id,
        changes: {
          action: "User Created",  // Nama aksi
          fields: Object.keys(req.body), // Ambil nama field yang di-create
          values: req.body, // Simpan semua nilai yang dikirim
        },
        createdBy,
      }, { transaction });
  
      await transaction.commit(); // ✅ Simpan ke database
      res.status(201).json({ message: "User & Log created", user: newUser });
    } catch (error) {
      await transaction.rollback(); // ❌ Batalkan jika ada error
      res.status(500).json({ message: "Error creating user", error });
    }
};

export const updateUser = async (req, res) => {
    const transaction = await sequelize.transaction();
  
    try {
      const userId = req.params.id;
      const createdBy = req.session.userId;
      if (!createdBy) {
        return res.status(401).json({ message: "Unauthorized: No user session" });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const updatedFields = {}; // Menyimpan hanya field yang berubah
      Object.keys(req.body).forEach((key) => {
        if (user[key] !== req.body[key]) {
          updatedFields[key] = req.body[key];
        }
      });
  
      await user.update(req.body, { transaction });
  
      if (Object.keys(updatedFields).length > 0) {
        await UserLog.create({
          userId,
          changes: {
            action: "User Updated",
            fields: Object.keys(updatedFields),
            values: updatedFields,
          },
          createdBy,
        }, { transaction });
      }
  
      await transaction.commit();
      res.status(200).json({ message: "User & Log updated", user });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: "Error updating user", error });
    }
};
  
export const deleteUser = async (req, res) => {
    const transaction = await sequelize.transaction();
  
    try {
      const userId = req.params.id;
      const createdBy = req.session.userId;
      if (!createdBy) {
        return res.status(401).json({ message: "Unauthorized: No user session" });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      await UserLog.create({
        userId,
        changes: {
          action: "User Deleted",
          values: user.toJSON(), // Simpan semua data sebelum dihapus
        },
        createdBy,
      }, { transaction });
  
      await user.destroy({ transaction });
  
      await transaction.commit();
      res.status(200).json({ message: "User & Log deleted" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: "Error deleting user", error });
    }
};

export const updatePassUser = async (req, res) => {
  const { password, confPassword } = req.body;

  // 1️⃣ Cek apakah password dan konfirmasi password cocok
  if (password !== confPassword) {
      return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
  }

  try {
      const userId = req.params.id;

      // 2️⃣ Cari user berdasarkan ID
      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // 3️⃣ Hash password baru
      const hashedPassword = await argon2.hash(password);

      // 4️⃣ Mulai transaksi database
      const transaction = await sequelize.transaction();

      try {
          // 5️⃣ Update password di database
          await user.update({ password: hashedPassword }, { transaction });

          // 6️⃣ Ambil user ID dari session atau token (pastikan session diimplementasikan)
          const updatedBy = req.session.userId || req.user.id || "System"; 

          // 7️⃣ Simpan log perubahan password
          await UserLog.create({
              user_id: userId, // Pastikan ini sesuai dengan nama kolom di database
              changes: JSON.stringify({ action: "Password Updated" }), // Simpan dalam format JSON
              createdBy: updatedBy,
          }, { transaction });

          // 8️⃣ Commit transaksi jika semua berhasil
          await transaction.commit();

          res.status(200).json({ message: "Password updated successfully" });

      } catch (error) {
          // 9️⃣ Rollback transaksi jika terjadi error
          await transaction.rollback();
          res.status(500).json({ msg: "Error updating password" });
      }
  } catch (error) {
      res.status(400).json({ msg: error.message });
  }
};

// export const createUser = async(req, res) =>{
//     try {
//         await User.create(req.body);
//         res.status(201).json({msg: "User Created"});
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// export const updateUser = async(req, res) =>{
//     try {
//         await User.update(req.body,{
//             where:{
//                 id: req.params.id
//             }
//         });
//         res.status(200).json({msg: "User Updated"});
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// export const deleteUser = async(req, res) =>{
//     try {
//         await User.destroy({
//             where:{
//                 id: req.params.id
//             }
//         });
//         res.status(200).json({msg: "User Deleted"});
//     } catch (error) {
//         console.log(error.message);
//     }
// }