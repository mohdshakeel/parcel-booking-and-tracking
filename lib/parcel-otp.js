
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



export async function sendSMS(phoneNumber, message) {
  const username = process.env.SMS_GATE_USERNAME;
  const password = process.env.SMS_GATE_PASSWORD;
  const smsUrl =
    process.env.SMS_GATE_URL ||
    "https://api.sms-gate.app/3rdparty/v1/messages";

  if (!username || !password) {
    throw new Error("SMS Gateway credentials are missing");
  }

  const credentials = Buffer.from(
    `${username}:${password}`
  ).toString("base64");

  const response = await fetch(smsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      textMessage: {
        text: message,
      },
      phoneNumbers: [phoneNumber],
    }),
    signal: AbortSignal.timeout(15000),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `SMS Gateway failed with status ${response.status}: ${responseText}`
    );
  }

  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch {
    return { raw: responseText };
  }
}
