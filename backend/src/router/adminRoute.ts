import express from "express";
import { adminController } from "../config/container";

const adminRouter = express.Router();

adminRouter.get("/users", adminController.getAllUsers);
adminRouter.get("/books", adminController.getAllBooks);
adminRouter.post("/books", adminController.createBook);
adminRouter.put("/books/:id", adminController.updateBook);
adminRouter.delete("/books/:id", adminController.deleteBook);

adminRouter.get("/purchases", adminController.getAllPurchases);
adminRouter.get("/revenue-summary", adminController.getRevenueSummary);

adminRouter.put("/users/:id", adminController.updateUser);
adminRouter.delete("/users/:id", adminController.deleteUser);


export default adminRouter;
