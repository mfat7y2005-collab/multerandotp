
import { Router } from "express";
import * as userService from "./user.service.js";
import { auth } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.js";
const userRouter = Router();
import * as user from "./user.validation.js";
import { multerEnum } from "../../enum/multer.enum.js";
import { multer_local } from "../../middleware/multer.js";
import { string } from "joi"; 
// ================== USER ROUTES ==================
// 1. Signup
userRouter.post(
  '/users/signup', 
    multer_local({ custom_types: [multerEnum.image] }).fields([{ name: "image" }]), 
    validation(user.signUpSchema), 
    userService.signUp 
);
// 2. Email Confirmation
userRouter.post(
  "/users/confirm-email", 
  validation(user.confirmEmailSchema), 
  userService.confirmEmail);
// 3. Sign In
userRouter.post(
  "/signIn", 
  validation(user.signInSchema), 
  userService.signIn);
  // 4. Confirm Sign In (2FA)
userRouter.post(
  "/signIn/confirm", 
  validation(user.confirmSignInSchema), 
  userService.confirmSignIn);
  // 5. Get Profile
userRouter.get(
  '/profile',
   auth,
    userService.getProfile);
    // 6. Update Profile
userRouter.post(
  "/users/2fa/enable",
   auth, userService.requestTwoFactorEnable);
   // 7. Verify 2FA OTP
userRouter.post(
  "/users/2fa/verify",
   auth, validation(user.otpOnlySchema),
    userService.verifyTwoFactorEnable);
    // 8. Disable 2FA
userRouter.patch(
  "/users/password", 
  auth, 
  validation(user.updatePasswordSchema),
   userService.updatePassword);
   // 9. Request Password Reset
userRouter.post(
  "/users/password/forgot", 
  validation(user.forgetPasswordSchema), 
  userService.forgetPassword);
  // 10. Reset Password
userRouter.post(
  "/users/password/reset", 
  validation(user.resetPasswordSchema), 
  userService.resetPassword);
  // 11. Logout
userRouter.post(
  "/logout", 
  auth, 
  userService.logout);
  // 12. Login with Gmail
userRouter.post(
  '/loginWithGmail', 
  validation(user.loginWithGmailSchema), 
  userService.loginWithGmail);
export default userRouter;