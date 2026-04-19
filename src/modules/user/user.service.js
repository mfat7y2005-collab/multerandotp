import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { OAuth2Client } from "google-auth-library";
import userModel from "../../DB/models/user.model.js";
import * as redisService from "../../DB/redis/redis.service.js";
import { sendEmail, generateOtp } from "../../utils/email/send.email.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { successResponse } from "../../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "ay 7aga";
const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 5;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= HELPERS =================

const throwError = (message, code = 400) => {
  const err = new Error(message);
  err.cause = code;
  throw err;
};

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
    jwtid: randomUUID(),
  });
};

const createAuthToken = (user) => {
  return generateToken({ id: user._id, email: user.email });
};

const getOtpExpiryDate = () =>
  new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

const findUserByEmail = (email) => {
  return userModel.findOne({ email: normalizeEmail(email) });
};

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

// ================= OTP =================

const setOtp = async (user, type) => {
  const otp = String(await generateOtp());

  user.otp = {
    type,
    code: await bcrypt.hash(otp, SALT_ROUNDS),
    expiresAt: getOtpExpiryDate(),
  };

  await user.save();
  return otp;
};

const validateOtp = async (otp, storedOtp) => {
  if (!storedOtp?.code || storedOtp.expiresAt < Date.now()) return false;
  return bcrypt.compare(String(otp), storedOtp.code);
};

// ================= AUTH =================

export const signUp = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, password, age, gender } = req.body;
  const email = normalizeEmail(req.body.email);

  let user = await findUserByEmail(email);

  if (user) {
    if (user.confirmed) throwError("Email already exists", 409);

    const otp = await setOtp(user, "confirm");

    user.firstName = firstName;
    user.lastName = lastName;
    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.age = age;
    user.gender = gender;

    await user.save();

    await sendEmail({
      to: email,
      subject: "Confirm your account",
      html: `<p>Your OTP is <b>${otp}</b></p>`,
    });

    return successResponse(res, {
      message: "OTP resent",
      data: { requiresEmailConfirmation: true },
    });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  user = await userModel.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    age,
    gender,
  });

  const otp = await setOtp(user, "confirm");

  await sendEmail({
    to: email,
    subject: "Confirm your account",
    html: `<p>Your OTP is <b>${otp}</b></p>`,
  });

  return successResponse(res, {
    message: "User created, confirm email",
    data: { user: sanitizeUser(user) },
    status: 201,
  });
});

// ================= CONFIRM EMAIL =================

export const confirmEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  const user = await findUserByEmail(email);
  if (!user) throwError("User not found", 404);

  const isValid = await validateOtp(otp, user.otp);
  if (!isValid) throwError("Invalid OTP", 401);

  user.confirmed = true;
  user.otp = undefined;

  await user.save();

  return successResponse(res, {
    message: "Email confirmed",
    data: { user: sanitizeUser(user) },
  });
});

// ================= LOGIN =================

export const signIn = asyncHandler(async (req, res) => {
  const { password, email } = req.body;

  const user = await findUserByEmail(email).select("+password");
  if (!user) throwError("Invalid credentials", 401);

  if (!user.confirmed) throwError("Confirm your email first", 403);

  if (user.loginBlockedUntil > Date.now()) {
    throwError("Account temporarily locked", 403);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.loginBlockedUntil = new Date(
        Date.now() + LOGIN_BLOCK_MINUTES * 60 * 1000
      );
      user.failedLoginAttempts = 0;
    }

    await user.save();
    throwError("Invalid credentials", 401);
  }

  user.failedLoginAttempts = 0;
  user.loginBlockedUntil = undefined;
  await user.save();

  const token = createAuthToken(user);

  return successResponse(res, {
    message: "Login success",
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

// ================= PROFILE =================

export const getProfile = asyncHandler(async (req, res) => {
  return successResponse(res, {
    message: "Profile data",
    data: { user: sanitizeUser(req.user) },
  });
});

// ================= LOGOUT =================

export const logout = asyncHandler(async (req, res) => {
  const { exp, jti } = req.decoded;

  const remaining = exp - Math.floor(Date.now() / 1000);

  if (jti) {
    await redisService.setValue({
      key: `revoked_token:${jti}`,
      value: "true",
      ttl: remaining > 0 ? remaining : 1,
    });
  }

  return successResponse(res, {
    message: "Logged out",
  });
});