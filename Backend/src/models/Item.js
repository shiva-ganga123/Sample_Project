import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
 owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 title: {type: String, required: true},
 category: {type: String, enum:['bill', 'policy', 'warranty', 'other'], default: 'bill'},
 amount: {type: Number, default: 0},
 dueDate: {type: Date},
 status: {type: String, enum: ['open','paid', 'expired'], default: 'open'},
 notes: {type: String}
}, {timestamps: true});

export default mongoose.model('Item', ItemSchema);