import { StreamChat } from "stream-chat";

// dotenv is already loaded by the first import in server.js, so no dotenv.config() needed here

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// FIXED: fail at startup with a clear message instead of a confusing error later
if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async ({ id, name, image }) => {
  try {
    // Only these three fields are ever sent to Stream. This blocks extras like `role`,
    // which could otherwise grant elevated permissions if a caller passed it by accident.
    const streamUser = { id: id.toString(), name, image: image || "" };
    await streamClient.upsertUsers([streamUser]);
    return streamUser;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error; // FIXED: let callers know it failed
  }
};

export const generateStreamToken = (userId) => {
  try {
    return streamClient.createToken(userId.toString());
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error; // FIXED: never hand back an undefined token
  }
};