import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js";

const PasswordReset = sequelize.define("password_resets", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "id" },
    onDelete: "CASCADE",
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  }
});

export default PasswordReset;
