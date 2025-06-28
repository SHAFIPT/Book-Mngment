import { Router } from "express";
import authRoute from "./authRoute";
import bookrouter from "./bookRoutes";
import purchaseRoute from "./purchaseRoute";
import adminRouter from "./adminRoute";
import notificationRouter from "./notificationRoute";
import reviewRouter from "./reviewRouter";

const router = Router()

router.use('/api/auth', authRoute)
router.use('/api/books', bookrouter); 
router.use('/api/purchase', purchaseRoute); 
router.use('/api/admin', adminRouter); 
router.use('/api/notification' , notificationRouter)
router.use('/api/reviews' , reviewRouter)

export default router