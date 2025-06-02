import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("[JWT] JWT_SECRET is not defined in environment variables");
  throw new Error("JWT_SECRET not configured");
}

export const verifyToken = (
  event: APIGatewayProxyEvent
): APIGatewayProxyResult | null => {
  const token = event.headers.Authorization?.split(" ")[1];

  if (!token) {
    console.log("[JWT] No token found in Authorization header");
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "No token provided" }),
    };
  }

  try {
    console.log(`[JWT] VERIFY: ${token} ${JWT_SECRET}`);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[JWT] Token verified successfully");
    console.log("[JWT] Decoded token:", JSON.stringify(decoded, null, 2));
    return null;
  } catch (error) {
    console.error("[JWT] Token verification failed:", error);
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Invalid token" }),
    };
  }
};

export const createUnauthorizedResponse = (): APIGatewayProxyResult => {
  return {
    statusCode: 401,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ message: "Invalid token" }),
  };
};
