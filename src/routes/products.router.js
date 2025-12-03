import express from "express";
import Product from "../models/product.model.js";

const productsRouter = express.Router();

const buildLinks = (req, docs) => {
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const { page, prevPage, nextPage, hasPrevPage, hasNextPage } = docs;

    const generateLink = (targetPage) => {
        const queryParams = new URLSearchParams(req.query);
        queryParams.set("page", targetPage);
        return `${baseUrl}?${queryParams.toString()}`;
    };

    return {
        prevLink: hasPrevPage ? generateLink(prevPage) : null,
        nextLink: hasNextPage ? generateLink(nextPage) : null,
    }
}

productsRouter.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort;
        const query = req.query.query;

        const filter = {};
        if (query) {
            const [key, value] = query.split(":");
            if (key && value) {
                if (key === "category") {
                    filter.category = value;
                } else if (key === "status") {
                    filter.status = value === "true";
                } else if (key === "brand") {
                    filter.brand = value;
                }
            }
        }

        let sortOptions = {};
        if (sort === "asc") {
            sortOptions.price = 1;
        } else if (sort === "desc") {
            sortOptions.price = -1;
        }


        const options = {
            limit: limit,
            page: page,
            sort: sortOptions,
            lean: true,
            customLabels: {
                docs: "payload",
                totalPages: "totalPages",
                prevPage: "prevPage",
                nextPage: "nextPage",
                page: "page",
                hasPrevPage: "hasPrevPage",
                hasNextPage: "hasNextPage",
            }
        };

        const result = await Product.paginate(filter, options);

        const links = buildLinks(req, result);

        const response = {
            status: "success",
            payload: result.payload,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: links.prevLink,
            nextLink: links.nextLink,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ status: "error", message: "Error al obtener los productos.", error: error.message });
    }
}
);

productsRouter.get("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await Product.findById(pid).lean();

        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado." });
        }
        res.status(200).json({ status: "success", payload: product });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener el producto" })
    }
})

productsRouter.post("/", async (req, res) => {
    try {
        const newProduct = req.body;
        const product = new Product(newProduct);
        await product.save();

        res.status(201).json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al agregar el producto." });
    }
});

productsRouter.put("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const updates = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(pid, updates, { new: true, runValidators: true });
        if (!updatedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado." });

        res.status(200).json({ status: "success", payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar el producto." });
    }
});

productsRouter.delete("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;

        const deletedProduct = await Product.findByIdAndDelete(pid);
        if (!deletedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado." });

        res.status(200).json({ status: "success", payload: deletedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto." });
    }
});

export default productsRouter;