import { User } from "../models/User.js";
import { MedicalReport } from "../models/MedicalReport.js";
import getDataUri from "../utils/dataUri.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const file = req.file;
    if (!name || !email || !password || !file) {
      return res.status(400).send({
        success: false,
        message: "Please enter all fields",
      });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).send({
        success: false,
        message: "user already exist",
      });
    }

    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    sendToken(res, user, "register successfully", 201);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please enter all fields",
      });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "incorrect password or email",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "incorrect password or email",
      });
    }

    sendToken(res, user, `Welcome back ${user.name}`, 200);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const logoutController = (req, res) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send({
      success: true,
      message: "logged out successfully",
    });
};

export const getMyProfileController = async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user._id);
    res.status(200).send({
      success: true,
      user,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error ",
    });
  }
};
export const updatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please enter all fields",
      });
    }
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "incorrect oldPassword",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "password changed successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
    });
  }
};
export const updateProfileController = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      blood_group,
      gender,
      country,
      state,
      city,
      pincode,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (blood_group) user.blood_group = blood_group;
    if (gender) user.gender = gender;
    if (country) user.country = country;
    if (state) user.state = state;
    if (city) user.city = city;
    if (pincode) user.pincode = pincode;
    await user.save();
    res.status(200).send({
      success: true,
      message: "profile updated successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const updateProfilePicController = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({
        success: false,
        message: "Please provide a avatar",
      });
    }
    const user = await User.findById(req.user._id);

    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    await user.save();
    res.status(200).send({
      success: true,
      message: "profile picture updated successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const updateMedicalReportController = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({
        success: false,
        message: "Please provide a medical report file.",
      });
    }
    const user = await User.findById(req.user._id);

    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "raw",
    });
    if (user.medical_report.public_id) {
      await cloudinary.v2.uploader.destroy(user?.medical_report?.public_id);
    }
    user.medical_report = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    user.save();
    res.status(200).send({
      success: true,
      message: "medical report updated successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const forgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "user not found",
      });
    }
    const resetToken = await user.getResetToken();
    await user.save();
    const url = `${process.env.FRONTEND_URL}/user/resetpassword/${resetToken}`;
    const message = `
    Click on the link to reset your password ${url} if you have not request then please ignore
    `;
    await sendEmail(user.email, "JetSetMed Reset Password", message);

    console.log("resetToken", resetToken);
    res.status(200).send({
      success: true,
      message: `reset token hab been send to ${user.email} `,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });
    if (!user) {
      res.status(401).send({
        success: false,
        message: "token is invalid or has been expired",
      });
    }
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();
    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const uploadProjectController = async (req, res) => {
  try {
    const file = req.files;
    // if (!file || !report_message || !report_title) {
    //   return res.status(400).send({
    //     success: false,
    //     message: "Please provide all fields",
    //   });
    // }

    // const fileUri = getDataUri(file);
    // const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    //   resource_type: "raw",
    // });
    // const user = await User.findById(req.user._id);

    // const medicalData = await MedicalReport.create({
    //   report_title,
    //   report_message,
    //   user: req.user._id,

    //   health_record: {
    //     public_id: myCloud.public_id,
    //     url: myCloud.secure_url,
    //   },
    // });
    // user.medical_reports.push(medicalData._id);
    // await user.save();
    res.status(200).send({
      success: true,
      message: "project  added successfully",
      file: req.file,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const getAllReportController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("medical_reports")
      .exec();
    const medicalReports = user.medical_reports;
    res.status(200).send({
      success: true,
      message: "medical report fetched successfully",
      medicalReports,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const deleteReportController = async (req, res) => {
  try {
    await MedicalReport.findByIdAndDelete(req.params.id);
    const user = await User.findById(req.user._id);
    const deleteReport = user.medical_reports.filter((m) => {
      return m.toString() !== req.params.id.toString();
    });
    user.medical_reports = deleteReport;
    await user.save();
    res.status(200).send({
      success: true,
      message: "medical report deleted successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const getAllUserController = async (req, res) => {
  try {
    const user = await User.find({});
    if (!user) {
      res.status(404).send({
        success: false,
        message: "no any user",
      });
    }
    res.status(200).send({
      success: true,
      message: "user is fetched successfully",
      user,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const changeRoleController = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).send({
        success: false,
        message: "user id is invalid",
      });
    }
    if (user.role === "admin") {
      user.role = "user";
    } else {
      user.role = "admin";
    }
    await user.save();

    res.status(200).send({
      success: true,
      message: "user role is changed",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
