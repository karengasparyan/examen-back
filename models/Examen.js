import { Model, DataTypes } from 'sequelize';
import db from '../services/db';

class Examen extends Model {

}

Examen.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  salePrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  qty: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  metaName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  metaDescription: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
}, {
  sequelize: db,
  modelName: 'products',
  tableName: 'products',
});

export default Examen;
