
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";

export function getBearerUser(request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (
      !payload ||
      typeof payload === "string" ||
      !(payload.id || payload.sub)
    ) {
      return null;
    }

    return {
      id: String(payload.id || payload.sub),
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function generateOtp() {
  return randomInt(0, 1_000_000)
    .toString()
    .padStart(6, "0");
}

export function hashOtp(otp, parcelId, purpose) {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is not configured");
  }

  return createHmac("sha256", secret)
    .update(`${parcelId}:${purpose}:${otp}`)
    .digest("hex");
}

export function otpHashesMatch(otp, storedHash, parcelId, purpose) {
  const submittedHash = Buffer.from(
    hashOtp(otp, parcelId, purpose),
    "hex"
  );

  const expectedHash = Buffer.from(storedHash, "hex");

  return (
    submittedHash.length === expectedHash.length &&
    timingSafeEqual(submittedHash, expectedHash)
  );
}

export function normalizePurpose(purpose) {
  return ["pickup", "delivery"].includes(purpose)
    ? purpose
    : null;
}


const sendSMS = async () => {
  try {
    const response = await fetch(
      process.env.SMS_GATE_URL 
      ,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer user:${process.env.SMS_GATE_USER},pass:${process.env.SMS_GATE_PASS}`,
        },
        body: JSON.stringify({
          phoneNumber: sendTo,
          message: message
        }),
      }
    );

    const data = await response.json();

    console.log("SMS response:", data);

    if (!response.ok) {
      throw new Error(data.message || "SMS failed");
    }

    return data;
  } catch (error) {
    console.error("Send SMS error:", error);
    throw error;
  }
};