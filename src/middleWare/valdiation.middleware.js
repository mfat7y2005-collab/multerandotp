import { signup } from "../modules/auth/auth.service.js"
import * as validation from "../modules/auth/auth.valdiation.js"

export const valdiation=(schema)=>{
    return(req,res,next)=>{
     const valdiationResult = schema.validate(req.body,{abortEarly:false})
      if (valdiationResult.error) {
        return res.status(400).json({ message: valdiationResult.error.details[0].message })
      }
      next()
}
}

export const valdiationParams=(schema)=>{
    return(req,res,next)=>{
     const valdiationResult = schema.validate(req.params,{abortEarly:false})
      if (valdiationResult.error) {
        return res.status(400).json({ message: valdiationResult.error.details[0].message })
      }
      next()
}
}