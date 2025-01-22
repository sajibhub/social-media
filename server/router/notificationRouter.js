import express from "express"
import Authorized from "../middleware/authorized.js"
import { NotificationAllClear, NotificationAllRead, NotificationClear, NotificationGet, NotificationRead } from "../controllers/notificationController.js"

const Notification = express.Router()

Notification.get("/user/notification/get", Authorized, NotificationGet)
Notification.put("/user/notification/read/:notificationId", Authorized, NotificationRead)
Notification.put("/user/notification/all/read", Authorized, NotificationAllRead)
Notification.delete("/user/notification/clear/:notificationId", Authorized, NotificationClear)
Notification.delete("/user/notification/all/clear", Authorized, NotificationAllClear)

export default Notification