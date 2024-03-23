import { Router } from "express";
import * as wishlistController from "../../controllers/client/wishlist";

const router = Router();

router.post("/wishlist/create", wishlistController.createWishlist);

router.delete("/wishlist/delete/:courseId", wishlistController.deleteWishlist);

export default router;
