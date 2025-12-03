import express from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";


const cartsRouter = express.Router();

cartsRouter.get("/:cid", async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await Cart.findById(cid).populate("products.product");
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado." });

        res.status(200).json({ status: "success", payload: cart.products });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});

cartsRouter.post("/", async (req, res) => {
    try {
        const cart = new Cart();
        await cart.save();
        res.status(201).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});

cartsRouter.post("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        const updatedCart = await Cart.updateOne(
            {
                _id: cid,
                "products.product": pid
            },
            {
                $inc: { "products.$.quantity": quantity }
            }
        );

        if (updatedCart.modifiedCount === 0) {
            const addProduct = await Cart.updateOne(
                { _id: cid },
                {
                    $push: {
                        products: {
                            product: pid,
                            quantity: quantity
                        }
                    }
                }
            );
            if (addProduct.modifiedCount === 0) {
                return res.status(404).json({ status: "error", message: `El carrito ID ${cid} no existe.` });
            }

            return res.status(200).json({ status: "success", message: `El producto ID ${pid} se agregó correctamente al carrito ${cid}.` }
            );
        };
        res.status(200).json({ status: "success", message: `Cantidad del producto ${pid} incrementada en el carrito ${cid}.` });
    } catch (error) {
        res.status(500).send({ status: "error", message: "Ha ocurrido un error al procesar la solicitud." });
    }
});

cartsRouter.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        const updateResult = await Cart.updateOne(
            {
                _id: cid,
                "products.product": pid
            },
            {
                $inc: { "products.$.quantity": quantity }
            }
        );
        if (updateResult.modifiedCount === 0) {
            const pushResult = await Cart.updateOne(
                { _id: cid },
                {
                    $push: {
                        products: {
                            product: pid,
                            quantity: quantity
                        }
                    }
                }
            );
            if (pushResult.modifiedCount === 0) {
                return res.status(404).json({ status: "error", message: `El carrito ${cid} no existe.` });
            }

            return res.status(200).json({ status: "success", message: `El producto ${pid} se agregó correctamente al carrito ${cid}.` });
        };

        res.status(200).json({ status: "success", message: `La cantidad del producto ${pid} se incrementó correctamente en el carrito ${cid}.` });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ status: "error", message: "ID de carrito o producto inválido." });
        }
        res.status(500).json({ status: "error", message: "Ha ocurrido un error interno en el servidor al procesar la solicitud." });
    }
});

cartsRouter.put("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const newProductsArray = req.body;

        if (!Array.isArray(newProductsArray)) {
            return res.status(400).json({ status: "error", message: "La solicitud de actualización debe contener un array de productos." })
        }
        const updatedCart = await Cart.findByIdAndUpdate(
            cid,
            { $set: { products: newProductsArray } },
            {
                new: true,
                runValidators: true
            }
        ).populate("products.product").lean();
        if (!updatedCart) {
            return res.status(404).json({ status: "error", message: `Carrito ID ${cid} no encontrado."` });
        }

        res.status(200).json({ status: "success", message: "Carrito actualizado correctamente.", payload: updatedCart });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: "error", message: "Error en validación: el formato del carrito es incorrecto.", detaile: messages });
        }
        if (error.name === "CastError") {
            return res.status(400).json({ status: "error", message: "ID de carrito inválido o ID de producto incorrecto." });
        }

        res.status(500).json({ status: "error", message: "Ha ocurrido un error al actualizar el carrito." });
    }
});


cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await Cart.updateOne(
            { _id: cid },
            {
                $pull: {
                    products: { product: pid }
                }
            }
        );
        if (updatedCart.modifiedCount === 0) {
            const cartExists = await Cart.findById(cid);
            if (!cartExists) {
                return res.status(404).json({ status: "error", message: `Carrito ID ${cid} no encontrado.` });
            } else {
                return res.status(404).json({ status: "error", message: `El producto ID ${pid} no se encontró en el carrito ${cid}.` });
            }
        }
        res.status(200).json({ status: "success", message: `El producto ID ${pid} se eliminó del carrito ${cid} correctamente.`, details: updatedCart })
    } catch (error) {
        res.status(500).json({ status: "error", message: "Ha ocurrido un error al procesar la eliminación del producto del carrito." })
    }
});

cartsRouter.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const updatedCart = await Cart.findByIdAndUpdate(
            cid,
            { products: [] },
            { new: true }
        ).populate("products.product").lean();

        if (!updatedCart) {
            return res.status(404).json({ status: "error", message: `El carrito ID ${cid} no existe.` });
        };

        res.status(200).json({ status: "success", message: `Los productos se eliminaron del carrito ${cid} correctamenet.`, details: updatedCart })
    } catch (error) {
        res.status(500).json({ status: "error", message: "Ha ocurrido un error al procesar el vaciamiento del carrito." })
    }
});
export default cartsRouter;