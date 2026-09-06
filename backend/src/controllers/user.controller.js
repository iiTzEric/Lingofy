import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {

    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // exclude the current user
                { _id: { $nin: currentUser.friends }}, // exclude the current user's friends
                {isOnboarded: true} // only include users who are onboarded
            ]
        })
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error fetching recommended users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id).select("friends")
        .populate("friends", "fullname email profilePicture nativeLanguage learningLanguage"); // populate friends with their details
        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error fetching my friends:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}