import { hash, compare } from "bcrypt";
import { SALT_ROUND } from "../../../../config/config.service.js";
import crypto   from "crypto";
import bcrypt from "bcrypt"



export const generateHash =async(plainText , salt=SALT_ROUND)=>{
    return await hash(plainText , salt)
}

export const compareHash =async(plainText , cipherText)=>{
    return await compare(plainText , cipherText)
}


const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


const hashedOTP = async()=>{
 return bcrypt.hash(otp, 10);
}

