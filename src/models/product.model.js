import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        index: true,
        default: "Smartphone"
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
        index: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    thumbnails: {
        type: [String],
        default: []
    },
    brand: {
        type: String,
        required: true,
        index: true
    },
    modelName: {
        type: String,
        required: true,
        index: true
    },
    model: {
        type: String,
        required: true,
        index: true
    },
    screenSize: {
        type: Number,
        requiered: true
    },
    storage: {
        type: Number,
        required: true
    },
    ram: {
        type: Number,
        required: true
    },
    camera: {
        type: String,
        default: "No especificado"
    },
    battery: {
        type: String,
        default: "No especificado"
    },
    color: {
        type: String,
        index: true,
        default: "Negro/Black"
    },
    operativeSystem: {
        type: String,
        default: "Android"
    }
}, {
    created_at: {
        type: Date,
        default: Date.now()
    }
});

productSchema.plugin(paginate);

//Modelo de datos
const Product = mongoose.model("Product", productSchema);


export default Product;