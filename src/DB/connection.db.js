import mongoose from "mongoose"
import { DB_URI } from "../../config/config.service.js"
import { UserModel } from "./model/user.model.js"



export const checkConnectionDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/BLOGAPP');
        console.log('Database Connected 😍😊');
    } catch (error) {
        console.error('Database  Failed!😈 ', error);
    }
};