import express from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const viewsRouter = express.Router();

viewsRouter.get("/products", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true,
        };

        if (sort) {
            options.sort = { price: sort === "asc" ? 1 : -1 };
        }

        const filter = query ? { category: query } : {};

        const result = await Product.paginate(filter, options);

        const productsPayload = {
            status: "success",
            products: result.docs,
            paging: {
                totalPages: result.totalPages,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
                nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            },
        };

        res.render("home", productsPayload);
    } catch (error) {
        res.render("home", { status: "error", message: "Error al cargar los productos." })
    }
});

viewsRouter.get("/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findById(cid).populate("products.product").lean();
        if (!cart) {
            return res.render("cart", { status: "error", message: `El carrito ID ${cid} no existe.`, cart: null });
        }
        res.render("cart", {
            status: "success",
            cartId: cid,
            cart: cart
        });
    } catch (error) {
        res.render("cart", { status: "error", message: "Error al cargar el detalle del carrito.", cart: null });
    }
});

viewsRouter.get("/products/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await Product.findById(pid).lean();

        if (!product) {
            return res.render('productDetail', { status: 'error', message: `El producto con ID ${pid} no existe.` });
        }

        res.render('productDetail', {
            status: 'success',
            product: product
        });

    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.render('productDetail', { status: 'error', message: 'Error al cargar el detalle del producto.' });
    }
});

export default viewsRouter;