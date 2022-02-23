const { connectDB } = require("./utilities/connectDB");
const Chance = require("chance");
const User = require("./models/user");
const Post = require("./models/post");
const { hashPassword } = require("./utilities/hashPassword");

connectDB();

// generate fake user data
const getFakeUserData = () => {
  const chance = new Chance();
  const firstname = chance.first().replace(" ", "");
  const lastname = chance.last().replace(" ", "");
  return Promise.resolve({
    username: `${firstname.toLowerCase()}${lastname.toLowerCase()}_${chance.integer(
      { min: 0, max: 100 }
    )}`,
    firstname,
    lastname,
    email: chance.email(),
    password: hashPassword("password123"),
  });
};

// create dummy users
const createDummyUsers = async () => {
  const createUserPromises = [...new Array(20)].map(async () => {
    const fakeUserData = await getFakeUserData();
    return new User(fakeUserData).save();
  });
  return await Promise.all(createUserPromises);
};

// follow each other
const followEachOther = async () => {
  const allUsers = await User.find({})
    .select("username following followers")
    .lean();

  allUsers.forEach(async (currentUser) => {
    const otherUsers = allUsers
      .filter((otherUser) => otherUser.username !== currentUser.username)
      .map((otherUser) => otherUser._id);

    await Promise.all([
      User.findByIdAndUpdate(currentUser._id, { following: otherUsers }),
      User.findByIdAndUpdate(currentUser._id, { followers: otherUsers }),
    ]);
  });

  console.log("Added following and followers");
  return Promise.resolve();
};

const createPosts = async () => {
  const chance = new Chance();
  const allUsers = await User.find({}).skip(3).limit(15).select("_id").lean();
  let postCounter = 0;
  allUsers.forEach(async (user) => {
    postCounter++;
    const post = await new Post({
      postedBy: user._id,
      post_caption: chance.sentence({ words: 5 }),
    }).save();
    await User.findByIdAndUpdate(user._id, {
      $push: {
        posts: post,
      },
    });
  });
  console.log("Added posts", postCounter);
  return Promise.resolve();
};

const createLikes = async () => {
  const chance = new Chance();
  const allPosts = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .select("_id")
    .lean();

  if (!allPosts) {
    return;
  }
  const allUsers = await User.find({}).limit(20).select("_id").lean();

  allUsers.forEach(async (user) => {
    // like any 4 posts
    const postsToLike = chance.pickset(allPosts, 4);
    const postPromises = postsToLike.map(async (post) => {
      return Post.findByIdAndUpdate(post._id, {
        $push: {
          likes: user._id,
        },
      });
    });

    await Promise.all(postPromises);
  });
  console.log("Added likes");
  return Promise.resolve();
};

async function main() {
  let start = new Date().getTime();
  // await createDummyUsers();
  // await followEachOther();
  // await createPosts();
  await createLikes();
  console.log(`finished in ${(new Date().getTime() - start) / 1000}s`);
  // process.exit();
}

main();
