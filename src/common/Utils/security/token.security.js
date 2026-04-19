import jwt from 'jsonwebtoken'
import { Expires_In_Access, Expires_In_Refersh, TOKEN_SECRET_KEY, TOKEN_SECRET_REFERSH_KEY, TOKEN_SYSTEM_REFERSH_SECRET_KEY, TOKEN_SYSTEM_SECRET_KEY } from '../../../../config/config.service.js'
import { audienceEnum ,RoleEnum, tokenTypeEnum} from '../../Enum/userEnum.js'
import { BadRequestExceptin, NotFoundException, UnauthorizedException } from '../response/error.response.js'
import { findOne } from '../../../DB/db.service.js'
import { UserModel } from '../../../DB/index.js'
import { NOTFOUND } from 'dns'


export const generateToken = async({
    payload = {},
    secret = TOKEN_SECRET_KEY,
    Option={}
}={})=>{
 return jwt.sign(payload,secret,Option)   
}
export const verifyToken = async({
    payload = {},
    secret = TOKEN_SECRET_KEY,
 
}={})=>{
 return jwt.verify(payload,secret)   
}



export const getTokenSignature = async (role)=>{
     let accessSignature = undefined
     let refershSignature = undefined
     let audience = audienceEnum.user
     switch (role) {
        case RoleEnum.admin:
            accessSignature =TOKEN_SYSTEM_SECRET_KEY
           refershSignature = TOKEN_SYSTEM_REFERSH_SECRET_KEY
           audience = audienceEnum.system
            break;
        default:
            accessSignature = TOKEN_SECRET_KEY
            refershSignature = TOKEN_SECRET_REFERSH_KEY
             audience = audienceEnum.user
            break;
     }
     return {accessSignature,refershSignature,audience}
}




export const getSignatureLevel = async (audienceEnum)=>{
    let SignatureLevel ;
     switch (audienceEnum) {
        case audienceEnum.system:
          SignatureLevel=RoleEnum.admin
            break;
        default:
       SignatureLevel =audienceEnum.user
            break;
     }
     return SignatureLevel
}



export const createloginCredentials = async(user,issuer)=>{
      const {accessSignature,refershSignature,audience}= await getTokenSignature(user.role)


        const access_token = await generateToken({
            payload:{sub: user._id},
            secret:accessSignature,
            Option:{
                issuer,
                audience:[tokenTypeEnum.access,audience],
                expiresIn:Expires_In_Access
            }
        })


        const REFERSH_token = await generateToken({
            payload:{sub: user._id},
            secret:refershSignature,
               Option:{
                issuer,
                audience:[tokenTypeEnum.refersh ,audience],
                expiresIn:Expires_In_Refersh
            }
        })
return {access_token ,REFERSH_token}
}


export const decodedToken = async({token ,tokentype=tokenTypeEnum.access}={})=>{
    const decode = jwt.decode(token)
    console.log({decode})
    if (!decode?.aud?.length) {
        throw new BadRequestExceptin({messsage:'faild decode token'})   
    }
    const [decodetokentype , audienceEnum] =decode.aud
    if (decodetokentype !== tokentype) {
        throw new BadRequestExceptin({messsage:`inval token`})
        
    }
    const SignatureLevel = await getSignatureLevel(audienceEnum)
    const {accessSignature,refershSignature} =await getTokenSignature(SignatureLevel)
    console.log({accessSignature,refershSignature})

    const verifyData = await verifyToken({
        token,
        secret:tokentype ==tokenTypeEnum.refersh ? refershSignature: accessSignature

    })
    const user =await findOne({model:UserModel , Filter:{_id:verifyData.sub}})
    if (!user) {
        throw UnauthorizedException({messsage:`not decoded`})
        
    }

    return user
}