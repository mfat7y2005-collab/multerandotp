import joi from 'joi'
import { fileValdiation } from '../../common/Utils/multer'


export const login = joi.object().keys({


email:joi.string().email({ minDomainSegments: 2,maxDomainSegments: 3,tlds:{allow: ['com', 'net', 'org']} }).required(),
password:joi.string().pattern(new RegExp(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\d){1,}(?=.*\W){1,}[\w\W\d].{8,25}$/)).required(),
}).required()



export const signup = login.append({

userName:joi.string().required(),
email:joi.string().email({ minDomainSegments: 2,maxDomainSegments: 3,tlds:{allow: ['com', 'net', 'org']} }).required(),
password:joi.string().pattern(new RegExp(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\d){1,}(?=.*\W){1,}[\w\W\d].{8,25}$/)).required(),
confirmPassword:joi.string().valid(joi.ref('password')).required().messages({'any.only':'confirm password must match password'})

})


export const signupParams = joi.object().keys({
lang:joi.string().valid('en', 'ar').required(),
flag:joi.string().valid('0', '1').required()
})


// fileValdiation={image: joi.object().keys({
//     mimetype: joi.string().valid('image/jpeg', 'image/png').required(),
//     size: joi.number().max(2 * 1024 * 1024).required() // 2MB
// }).required()}
