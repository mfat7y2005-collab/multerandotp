import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV

const envPath = {
    development: `.env.development`,
    production: `.env.production`,
}
console.log({ en: envPath[NODE_ENV] });


config({ path: resolve(`./config/${envPath[NODE_ENV]}`) })


export const port = process.env.PORT ?? 7000

export const DB_URI = process.env.DB_URI 
export const ENC_B = process.env.ENC_B 
export const TOKEN_SYSTEM_SECRET_KEY = process.env.TOKEN_SYSTEM_SECRET_KEY
export const TOKEN_SYSTEM_REFERSH_SECRET_KEY = process.env.TOKEN_SYSTEM_REFERSH_SECRET_KEY
export const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY
export const TOKEN_SECRET_REFERSH_KEY = process.env.TOKEN_SECRET_REFERSH_KEY 
export const Expires_In_Access = parseInt(process.env.Expires_In_Access)
export const Expires_In_Refersh= parseInt(process.env.Expires_In_Refersh)




export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
console.log({SALT_ROUND});
