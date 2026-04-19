import crypto from "crypto"
import { ENC_B } from "../../../../config/config.service.js";

const IV_LENGTH= 16 ; 
const ENCRYPTION_KEY = Buffer.from(ENC_B)

export const encrypt =(text)=>{
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv('aes-256-cbc' ,ENCRYPTION_KEY,iv)

    let encryptedData =cipher.update(text,'utf-8' ,'hex')
    encryptedData += cipher.final('hex')

    return `${iv.toString('hex')}:${encryptedData}`
}


export const decrypt = (encryptedData) =>{
    const [iv , encryptedText] = encryptedData.split(":")

    const binaryLikeIv = Buffer.from (iv , "hex")
    const decipher = crypto.createCipheriv('aes-256-cbc',ENCRYPTION_KEY , binaryLikeIv)

    let decryptedData = decipher.update(encryptedText,'hex','utf-8')
    decryptedData += decipher.final('utf-8')
    return decryptedData;
}