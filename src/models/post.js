const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post_caption: {
      type: String,
      required: true,
      maxlength: [280, "post caption is too long"], // twitter max characters 280
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

postSchema.set("toJSON", {
  transform: (_document, retObj) => {
    retObj._id = retObj._id.toString();
    delete retObj._id;
    delete retObj.__v;
  },
});

module.exports = model("Post", postSchema);
