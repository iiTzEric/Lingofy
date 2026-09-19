import mongoose from "mongoose";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// The only fields of ANOTHER user that are ever sent to the browser.
// Never add password, email, googleId or friends here.
const PUBLIC_USER_FIELDS = "fullname profilePicture bio nativeLanguage learningLanguage location";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // exclude the current user
                { _id: { $nin: currentUser.friends }}, // exclude the current user's friends
                { isOnboarded: true } // only include users who are onboarded
            ]
        }).select(PUBLIC_USER_FIELDS); // FIXED: no more password hashes, emails or googleIds

        res.status(200).json(recommendedUsers);
        } catch (error) {
        // 11000 = duplicate key: the unique index caught a double-click or race
        if (error.code === 11000) {
            return res.status(400).json({ message: "A friend request already exists between you and this user." });
        }
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", PUBLIC_USER_FIELDS); // FIXED: friends' emails are no longer exposed
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

        // FIXED: a malformed id used to throw a CastError and return a 500
        if (!mongoose.isValidObjectId(recipientId)) {
            return res.status(400).json({ message: "Invalid user id." });
        }

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

        await newFriendRequest.save();

        res.status(201).json({ message: "Friend request sent successfully." });

    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        // FIXED: malformed ids now return 400 instead of 500
        if (!mongoose.isValidObjectId(requestId)) {
            return res.status(400).json({ message: "Invalid request id." });
        }

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        // verify the current user is the recipient of the friend request
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request." });
        }

        // NEW: only pending requests can be accepted
        if (friendRequest.status !== "pending") {
            return res.status(400).json({ message: "This friend request has already been handled." });
        }

        // add each user to the other's friends list.
        // Done BEFORE marking the request accepted: if this fails, the request stays
        // pending and can be retried ($addToSet makes repeating it safe).
        await Promise.all([
            User.findByIdAndUpdate(friendRequest.sender, { $addToSet: { friends: friendRequest.recipient } }),
            User.findByIdAndUpdate(friendRequest.recipient, { $addToSet: { friends: friendRequest.sender } }),
        ]);

        friendRequest.status = "accepted";
        await friendRequest.save();

        res.status(200).json({ message: "Friend request accepted successfully." });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullname profilePicture nativeLanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullname profilePicture");

        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        console.log("Error in getFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient", "fullname profilePicture nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}