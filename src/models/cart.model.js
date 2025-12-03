import mongoose, { Mongoose } from "mongoose";

const productInCartSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, "La cantidad debe ser como mínimo 1"],
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    products: {
        type: [productInCartSchema],
        default: []
    },
    createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;