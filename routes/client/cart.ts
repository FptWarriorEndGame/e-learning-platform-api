import { Router } from "express";
import isUserAuth from "../../middleware/is-user-auth";
import * as cartController from "../../controllers/client/cart";

const router = Router();

router.get("/retrieve", cartController.retrieveCartByIds);

router.get("/get-total-price", isUserAuth, cartController.getTotalPrice);

router.get("/get-total-price-without-user", cartController.getTotalPriceWithoutUser);

export default router;
