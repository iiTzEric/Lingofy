import { generateStreamToken } from "../lib/stream.js";

export function getStreamToken(req, res) {
    try {
        // The id comes from the verified cookie (protectRoute), never from user input
        const token = generateStreamToken(req.user.id);

        res.status(200).json({ token });
    } catch (error) {
        console.log("Error in getStreamToken controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}