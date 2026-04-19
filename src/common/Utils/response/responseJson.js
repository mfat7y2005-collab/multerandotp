

export const successResponse = ({ res, message="Done" , status=201 , data = undefined }={}) =>{
    return res.status(status).json({status , message , data})
} 