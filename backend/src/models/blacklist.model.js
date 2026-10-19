const mongoose = require("mongoose");

const tokenBlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required to be added to black list"],
    },
  },
  {
    timestamps: true,
  },
);

const tokenBlackListModel = mongoose.model(
  "tokenBlackList",
  tokenBlackListSchema,
);

module.exports = tokenBlackListModel;
