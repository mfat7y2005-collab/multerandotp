import mongoose from "mongoose"
import { GenderEnum , ProviderEnum, RoleEnum} from "../../common/Enum/userEnum.js"

const userSchema = new mongoose.Schema ({

    firstName:{
        type:String,
        required:false ,
        minLength:3,
        mixLength:20,
    },

    lastName:{
        type:String,
          required:false  ,
        minLength:3,
        mixLength:15,
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    EmailVerified: {
    type: Boolean,
    default: false
    
  },

    emailOTP: String,
  emailOTPExpires: Date,




    password:{
        type:String,
        required:true,
        minLength:5,
        mixLength:25,
    },

    DOB:Date, 

    gender:{
        type:String,
       enum: Object.values(GenderEnum),
       default: GenderEnum.male

    },

    phone:{type:String, },

    confirmEmail:Date,

    ProviderEnum:{
        type:String,
        enums:Object.values(ProviderEnum),
        default:ProviderEnum.system
    },

    Role:{
        type:Number,
        enums:Object.values(RoleEnum),
        default:RoleEnum.admin
    }
    


},{
    collection:"lec_week_9",
    timestamps:true,
    strict:true,
    strictQuery:true
})




userSchema.virtual('userName').set(function (value){
    const [firstName ,lastName] = value?.split(' ') || []
    this.set({firstName , lastName})
})  .get(function(){
    return this.firstName + " " + this.lastName
})


export const UserModel = mongoose.models.User|| mongoose.model("user" ,userSchema)