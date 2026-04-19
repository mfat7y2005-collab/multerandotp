import { model, Model } from "mongoose";
import { ProviderEnum, RoleEnum, tokenTypeEnum } from "../../common/Enum/index.js";
import { compareHash, conflictExceptin ,  createloginCredentials,  encrypt,  generateToken,  getTokenSignature,  NotFoundException, } from "../../common/Utils/index.js";
import { UserModel ,findOne ,create} from "../../DB/index.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Expires_In_Access, Expires_In_Refersh, TOKEN_SECRET_KEY, TOKEN_SECRET_REFERSH_KEY, TOKEN_SYSTEM_REFERSH_SECRET_KEY, TOKEN_SYSTEM_SECRET_KEY } from "../../../config/config.service.js";




export const signup = async (inputs) => {
    const {userName , email , password , phone} = inputs;
    const CheckEmailExist = await findOne({
        model:UserModel,
        Filter:{email}
    })
     if (CheckEmailExist) {
        return conflictExceptin({message:"email exist"})  
     }
       const hashedPassword = await bcrypt.hash(password, 10)


    
     const [user] = await create({
        model:UserModel,
        data:[{userName
             , email ,
            //  phone: encrypt(phone) , 
            //  password: await generateHash(password) ,
                password: hashedPassword ,
              Provider:ProviderEnum.system}]
     })
    
    return user
}


export const login = async (inputs,issuer) => {
    const { email , password} = inputs;
    const user = await findOne({
        model:UserModel,
        Filter:{email,Provider:ProviderEnum.system}
    })
     if (!user) {
        return NotFoundException({message:`not login user`}) 
     }

     const match = await compareHash(password , user.password)
     if (!match) {
        return NotFoundException({message:`invalid password`})
        
     }


    return await createloginCredentials(user ,issuer)
}