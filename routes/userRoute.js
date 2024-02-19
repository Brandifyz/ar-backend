import express from "express";
const router = express.Router();
import {
  registerController,
  loginController,
  logoutController,
  getMyProfileController,
  updatePasswordController,
  updateProfileController,
  updateProfilePicController,
  forgetPasswordController,
  resetPasswordController,
  uploadProjectController,
  getAllUserController,
  changeRoleController,
} from "../controllers/userController.js";
import { isAdmin, isAuthenticated } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";
import { multipleUpload } from "../middleware/multipleMulter.js";
router.post("/register", singleUpload, registerController);
router.post("/login", loginController);
router.get("/logout", logoutController);
router.get("/me", isAuthenticated, getMyProfileController);
router.put("/updatepassword", isAuthenticated, updatePasswordController);
router.put("/updateprofile", isAuthenticated, updateProfileController);
router.put(
  "/updateprofilepic",
  isAuthenticated,
  singleUpload,
  updateProfilePicController
);

router.post("/forgetpassword", forgetPasswordController);
router.put("/resetpassword/:token", resetPasswordController);
router.post(
  "/uploadproject",

  isAuthenticated,
  multipleUpload,
  uploadProjectController
);
router.get("/alluser", isAuthenticated, isAdmin, getAllUserController);
router.put("/chagerole/:id", isAuthenticated, isAdmin, changeRoleController);

export default router;
