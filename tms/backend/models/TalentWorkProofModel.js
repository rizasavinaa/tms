import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js";
import Talent from "./TalentModel.js";
import Client from "./ClientModel.js";

const TalentWorkProof = sequelize.define('talent_work_proof', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  talent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file_link: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  public_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  resource_type: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  validation_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  validation_message: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "",
  },
  salary: {
    type: DataTypes.DECIMAL(10, 0),
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdby: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  freezeTableName: true,
});

Talent.hasMany(TalentWorkProof, { foreignKey: 'talent_id' });
TalentWorkProof.belongsTo(Talent, { foreignKey: 'talent_id' });

Client.hasMany(TalentWorkProof, { foreignKey: 'client_id' });
TalentWorkProof.belongsTo(Client, { foreignKey: 'client_id' });

export default TalentWorkProof;