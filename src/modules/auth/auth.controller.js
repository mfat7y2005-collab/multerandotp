import { Router } from 'express'
import { signup, login } from './auth.service.js';
import { successResponse } from '../../common/Utils/index.js';
import * as validation from './auth.valdiation.js'
import joi from 'joi'
import { valdiation, valdiationParams } from '../../middleWare/valdiation.middleware.js';

const router = Router(); 

router.post("/signup/:lang",
   valdiation(validation.signup),
valdiationParams(validation.signupParams), 
async (req, res, next) => {

 // const signupSchema = joi.object({
    //string .empty() , .valid('male', 'female') , .not('male', 'female') , .trim() , .lowercase() , .uppercase() , .alphanum()  , .length(10) , .min(2) , .max(20)
    //number .integer() , .positive() , .negative() , .greater(5) , .less(10) , .precision(2), .multiple(5) , .min(1) , .max(100)
    //array .items(joi.string()) , .min(1) , .max(5) , .length(3)
    //boolean .valid(true) , .valid(false)
    //date .iso() , .greater('now') , .less('2025-01-01')
    //object .keys({name: joi.string().required(), age: joi.number().required()}) , .min(1) , .max(5)
    
    //userName: joi.string().min(2).max(20).message("Username must be between 2 and 20 characters").required(),//.lenght(20)
    //email: joi.string().email().message("Invalid email format").required(),
    //password: joi.string().pattern(new RegExp(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\d){1,}(?=.*\W){1,}[\w\W\d].{8,25}$/))
  //})//.required()
// .or('userName', 'email') // At least one of userName or email must be provided

  const value = req.body   // ✅ تعديل هنا فقط بدل valdiationResult.value

  const account = await signup(value)

  return successResponse({ res, status: 201, data: { account } })
})

router.post("/login", valdiation(validation.login),async (req, res, next) => {

    console.log(`${req.protocol}://${req.host}`)
    
    const account = await login(req.body ,`${req.protocol}://${req.host}` )
    
    return successResponse ({res, status:201 , data:{account}})
})

export default router