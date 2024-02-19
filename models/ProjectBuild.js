import mongoose from "mongoose";

const projectSchemaSchema = new mongoose.Schema(
  {
    target: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    content: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    targetMind: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    artWorkName: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export const ProjectBuild = new mongoose.model(
  "ProjectBuild",
  projectSchemaSchema
);
