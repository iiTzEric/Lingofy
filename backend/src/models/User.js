import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        // unique removed: names aren't unique identifiers, email is
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        // Only required for email/password accounts, not Google sign-ins
        required: function () {
            return !this.googleId;
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // lets many users have no googleId without index conflicts
    },
    bio: {
        type: String,
        default: '',
    },
    profilePicture: {
        type: String,
        default: '',
    },
    nativeLanguage: {
        type: String,
        default: '',
    },
    learningLanguage: {
        type: [String],
        default: [],
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true }); // This option automatically adds createdAt and updatedAt fields to the schema

// Pre-save hook to hash the password before saving the user document
userSchema.pre('save', async function () {
    // Skips Google users too, since they have no password to hash
    if (!this.password || !this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    // Google-only accounts have no password, so password login always fails
    if (!this.password) return false;
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
    return isPasswordCorrect;
};

const User = mongoose.model('User', userSchema);

export default User;