 import { NODE_ENV } from "../../../../config/config.service.js";
 


 export const  globalErrorHandling = (error , req ,res , next )=>{
    const status = error.cause?.status?? 500;
    const mood = NODE_ENV =="production"
    const defaultErrorMesssage = "somthing went worng"
    const displayErrorMessage = error.message || defaultErrorMesssage
    return res.status(status).json({

           status,
        stack:mood ? undefined :error.stack,
        errorMessage: mood ? status == 500? defaultErrorMesssage : displayErrorMessage : displayErrorMessage
    })}
     

/* export const ErrorException =({ message = "faild" , cause =undefined }={})=> {
    throw new Error(message, {cause})
}
 */
 export const ErrorResponse = ({message="Error",status = 400 , extra=undefined }= {}) =>{
     throw new Error (message , {cause:{status ,extra}})
} 




export const BadRequestExceptin = (message="BadRequestExcepton" , extra = {}) =>{
    return ErrorResponse({message , status:400  ,extra})
}

export const conflictExceptin = (message="conflictExcepton " , extra = {}) =>{
    return ErrorResponse({message:"email is exist" , status:409  ,extra})
}
export const UnauthorizedException = (message="UnauthorizedException " , extra = {}) =>{
    return ErrorResponse({message , status:401  ,extra})
}
export const NotFoundException  = (message="NotFoundException  " , extra = {}) =>{
    return ErrorResponse({message , status:401  ,extra})
}
export const ForBeddenException  = (message="ForBeddenException  " , extra = {}) =>{
    return ErrorResponse({message , status:403  ,extra})
}
