import { DataTypes } from "sequelize";
import { dbSequelize } from "../config/database.js";




 const User = dbSequelize.define('User',{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },firstName:{
        type:DataTypes.STRING(255),
        allowNull:false,
        field: 'first_name'
    },
    lastName:{
        type:DataTypes.STRING(255),
        allowNull:false,
        field: 'last_name'
    },
    email:{
        type:DataTypes.STRING(180),
        allowNull:false,
        unique:true,
        validate:{isEmail:true}
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false

    },
    role:{
        type:DataTypes.ENUM('admin','member'),
        allowNull:false,
        defaultValue:'member'
    }
},{
    tableName:'users',
    timestamps:true,
    underscored:true
});



export default User;