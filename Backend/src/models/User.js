import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String},
    provider: {type: String, enum: ['google', 'local'], default: 'local'},
    providerId: {type: String},
    tokenVersion: {type: Number, default: 0},
   }, {timestamps: true}
);

export default mongoose.model('User', UserSchema);
