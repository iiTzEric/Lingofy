import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

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

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId } = req.params; // recipient's ID

        // prevent sending a friend request to oneself
        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself." });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found." });
        }

        // check if user is already friends with the recipient
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user." });
        }

        // check if a request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ],
        });

        if (existingRequest) {
            return res.status(400).json({ message: "A friend request already exists between you and this user." });
        }

        // create a new friend request
        const newFriendRequest = new FriendRequest({
            sender: myId,
            recipient: recipientId,
        });
        
        res.status(201).json({ message: "Friend request sent successfully." });

    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}