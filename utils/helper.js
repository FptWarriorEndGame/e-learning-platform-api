const Course = require("../models/Course");
const IsLessonDone = require("../models/IsLessonDone");
const Lesson = require("../models/Lesson");
const Order = require("../models/Order");
const Section = require("../models/Section");
const { Configuration, OpenAIApi } = require("openai");
const mongoose = require("mongoose");
const { courseNames, devopsCourses, blockchainCourses } = require("./fakerData");
const slugify = require("slugify");
const { faker } = require("@faker-js/faker");
// const myApiKey = "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";
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { UNSPLASH_API_KEY, OPEN_AI_KEY } = require("../config/constant");
const { BACKEND_URL } = require("../config/backend-domain");
const configuration = new Configuration({
  apiKey: OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);
exports.openai = openai;
// const chatCompletion = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   messages: [{ role: "user", content: "Hello world" }],
// });
// console.log(chatCompletion.data.choices[0].message);

exports.updateStockQty = updateStockQty = (courseList) => {
  courseList.forEach(async (course) => {
    const { prodId, qty } = course;
    console.log("update stock qty at database!!!");
    const courseItem = await course.findById(prodId);
    courseItem.stockQty = courseItem.stockQty - qty;
    courseItem.save();
  });
};

exports.getCoursesOrderByUserId = async (userId) => {
  const courses = await Order.find({
    "user._id": userId,
  })
    .select("items")
    .populate("items._id");

  const results = courses
    .map((courseItem) => {
      return courseItem.items;
    })
    .flat()
    .map((item) => item._id);

  return results;
};

exports.getProgressOfCourse = async (courseId, userId) => {
  const sectionsOfCourse = await Section.find({
    courseId,
  });
  let numOfLessonDone = 0;
  let totalVideosLengthDone = 0;
  let lessonsOfCourse = [];

  for (const section of sectionsOfCourse) {
    const lessons = await Lesson.find({
      sectionId: section._id,
    });
    lessonsOfCourse.push(lessons);
  }

  lessonsOfCourse = lessonsOfCourse.flat();

  for (const lesson of lessonsOfCourse) {
    const isDone = await IsLessonDone.findOne({
      userId,
      lessonId: lesson._id,
    });

    if (isDone) {
      numOfLessonDone += 1;
      totalVideosLengthDone += lesson.videoLength;
    }
  }

  const numOfLessons = lessonsOfCourse.length;

  let progress = 0;

  if (numOfLessons === 0) {
    progress = 0;
  } else {
    progress = numOfLessonDone / numOfLessons;
  }

  return {
    progress,
    totalVideosLengthDone,
  };
};

// Function to generate random courses
exports.generateRandomCoursesFakerjs = (numCourses) => {
  const courses = [];
  for (let i = 0; i < numCourses; i++) {
    const course = {
      name: courseNames[Math.floor(Math.random() * courseNames.length)],
      subTitle: faker.lorem.sentence(),
      thumbnail: `https://placeimg.com/640/480/tech/${i + 1}`,
      access: faker.random.arrayElement(["Free", "Paid"]),
      views: faker.datatype.number({ min: 0, max: 1000 }),
      price: faker.datatype.number({ min: 0, max: 100 }),
      finalPrice: faker.datatype.number({ min: 0, max: 100 }),
      description: courseDescriptions[Math.floor(Math.random() * courseDescriptions.length)],
      level: faker.random.arrayElement(["Beginner", "Intermediate", "Advanced"]),
      courseSlug: faker.lorem.slug(),
      userId: mongoose.Types.ObjectId(),
      categoryId: mongoose.Types.ObjectId(),
      requirements: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () =>
        mongoose.Types.ObjectId()
      ),
      willLearns: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () =>
        mongoose.Types.ObjectId()
      ),
      tags: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () =>
        mongoose.Types.ObjectId()
      ),
    };
    courses.push(course);
  }
  return courses;
};

const generateCourseDescriptionByCourseName = async (courseName) => {
  try {
    console.log("course name: ", courseName);

    const prompt = `Generate a course description for the course: "${courseName}".`;
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Choose an appropriate engine
      prompt,
      max_tokens: 100, // Adjust the length of the generated description
      n: 1,
      temperature: 0.2,
    });
    const description = response.data.choices[0].text.trim();
    return description;
  } catch (error) {
    console.log("Error generating description:", error);
    // If there's an error, you can provide a fallback or placeholder description.
    return "Description not available.";
  }
};

const sanitizeFileName = (fileName) => {
  // Replace invalid characters with an underscore
  return fileName.replace(/[/\\?%*:|"<>]/g, "_");
};

const generateThumbnailFromAi = async (courseName) => {
  try {
    const response = await openai.createImage({
      prompt: `${courseName} thumbnail course`,
      n: 1,
      size: "512x512",
    });
    const imageUrl = response.data.data[0].url;

    // Extract the image file name from the URL
    const parsedUrl = new URL(imageUrl);
    const imageFileName = path.basename(parsedUrl.pathname);

    console.log("image file name: " + imageFileName);

    // Sanitize the course name for use as a file name
    const sanitizedCourseName = sanitizeFileName(courseName);
    const imagePath = path.join(
      __dirname,
      "..",
      "images",
      `${sanitizedCourseName}-${imageFileName}`
    );

    // Download the image using Axios
    const imageResponse = await axios.get(imageUrl, { responseType: "stream" });

    // Create a write stream to save the image
    const writer = fs.createWriteStream(imagePath);
    imageResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        const imageUrlForFrontend = `${BACKEND_URL}/images/${sanitizedCourseName}-${imageFileName}`;
        resolve(imageUrlForFrontend);
      });
      writer.on("error", reject);
    });

    return imagePath;
  } catch (error) {
    console.log("Error generating thumbnail:", error);
    // If there's an error, you can provide a fallback thumbnail URL.
    return faker.image.urlLoremFlickr({ category: courseName });
  }
};

// Function to generate random courses
exports.generateRandomCourses = async (numCourses) => {
  // const courseDescriptions = await generateCourseDescriptions(numCourses);
  const categoriesIdList = [
    "646781266859a50acfca8e93",
    "64b363573bbbb6317297378d",
    "64b363b13bbbb6317297378f",
    "64b364203bbbb63172973793",
    "64bb4e1582a5abc6b1c13305",
  ];
  const backendId = "646781266859a50acfca8e93";
  const frontendId = "64b363573bbbb6317297378d";
  const iotId = "64b364203bbbb63172973793";
  const blockchainId = "64bb4e1582a5abc6b1c13305";
  const devopsId = "64bb411b19f0935f065b9898";

  const courses = [];
  for (let i = 0; i < numCourses; i++) {
    const courseName = blockchainCourses[i];

    // Generate thumbnail image using OpenAI
    const thumbnail = await generateThumbnailFromAi(courseName);

    const price = Math.floor(Math.random() * 50) + 100;
    const description = await generateCourseDescriptionByCourseName(courseName);
    const course = {
      name: courseName,
      subTitle: "Subtitle not available.", // You can provide a static value for the subtitle or generate it using OpenAI as well
      thumbnail,
      access: "PAID", // You can adjust this based on your requirements
      views: 0,
      price: price,
      finalPrice: price - 20,
      description: description,
      level: "All Level", // You can adjust this based on your requirements
      courseSlug: slugify(courseName, { lower: true, strict: true }), // Generate a unique slug for each course
      userId: "6468a145401d3810494f4797", // You can adjust this based on your requirements
      // categoryId: categoriesIdList[Math.floor(Math.random() * categoriesIdList.length)],
      categoryId: blockchainId,
      requirements: [],
      willLearns: [],
      tags: [],
    };
    courses.push(course);
  }
  return courses;
};

const generateThumbnailFromUnsplash = async (courseName) => {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query: courseName,
        orientation: "landscape",
        client_id: UNSPLASH_API_KEY,
        per_page: 10,
      },
    });

    return response.data.results[0].urls.regular;
  } catch (error) {
    console.log("Error generating thumbnail:", error);
    // If there's an error, you can provide a fallback thumbnail URL.
    return faker.image.urlLoremFlickr({ category: courseName });
  }
};

const createOutline = async (courseId) => {
  try {
    // const courseId = "64c5d873c573c1ec5d4a1907"; // Replace with the actual course ID

    const courseSections = await generateSectionsName(courseId);

    console.log("course sections: ", courseSections.length);
    console.log("course sections: ", courseSections);

    // Generate and save the sections for the course
    const sections = courseSections.map((sectionName, index) => ({
      courseId,
      name: `Section ${String(index + 1).padStart(2, "0")}: ${sectionName}`,
      access: "PAID", // Adjust the access type as needed
      description: "", // Add a description for each section if required
    }));

    const createdSections = await Section.insertMany(sections);
    console.log("Sections created:", createdSections);
    return createdSections;
  } catch (error) {
    console.log("Error generating outline:", error);
    return [];
  }
};

const generateSectionsName = async (courseId) => {
  try {
    const courseName = (await Course.findById(courseId).select("name")).name;
    console.log("course name: ", courseName);
    const prompt = `Generate a course outline (curriculum) for the course: "${courseName}". and wrap all the section into an string like this: introduction, type of cyber attack, footerpring, section title, section title,...  .Remember that in each section name not break down the line`;
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Choose an appropriate engine
      prompt,
      max_tokens: 200, // Adjust the length of the generated description
      n: 1,
      temperature: 0.2,
    });
    const courseOutline = response.data.choices[0].text.trim().replace(/\\n/g, ""); // Remove '\n' characters;
    return courseOutline.split(",");
  } catch (error) {
    console.log("Error generating courseOutline:", error);
    // If there's an error, you can provide a fallback or placeholder courseOutline.
    return "courseSectionName not available.";
  }
};

const generateLessonBySectionName = async (outlineOfCourse) => {};

exports.generateSectionsName = generateSectionsName;
exports.createOutline = createOutline;
