import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    report_title: {
      type: String,
      required: [true, "Please enter name of report"],
    },
    report_message: {
      type: {},
      required: [true, "Please enter report description"],
    },
    health_record: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export const MedicalReport = new mongoose.model(
  "MedicalReport",
  medicalReportSchema
);
