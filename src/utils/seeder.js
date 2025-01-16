import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subject } from "../models/subjects.model.js";
import { Category } from "../models/categories.model.js";
import { Question } from "../models/questions.model.js";
import { Choice } from "../models/choices.model.js";
import { Quiz } from "../models/quizzes.model.js";
import { QuizQuestion } from "../models/quiz_questions.model.js";
import dotenv from "dotenv";
import connectDB from "../db/db.js";

dotenv.config();

const sampleData = {
  subjects: [
    { name: "Mathematics" },
    { name: "Physics" },
    { name: "Chemistry" },
  ],

  categories: {
    Mathematics: [
      { name: "Algebra" },
      { name: "Geometry" },
      { name: "Calculus" },
    ],
    Physics: [
      { name: "Mechanics" },
      { name: "Thermodynamics" },
      { name: "Electromagnetism" },
    ],
    Chemistry: [
      { name: "Organic Chemistry" },
      { name: "Inorganic Chemistry" },
      { name: "Physical Chemistry" },
    ],
  },

  questions: {
    Algebra: [
      {
        text: "Solve for x: 2x + 5 = 13",
        choices: [
          {
            text: "x = 4",
            is_correct: true,
            explanation: "2x + 5 = 13 → 2x = 8 → x = 4",
          },
          { text: "x = 6", is_correct: false },
          { text: "x = 3", is_correct: false },
          { text: "x = 5", is_correct: false },
        ],
      },
      {
        text: "What is the value of y in: y² = 16",
        choices: [
          {
            text: "y = 4 or y = -4",
            is_correct: true,
            explanation: "Square root of 16 is ±4",
          },
          { text: "y = 4", is_correct: false },
          { text: "y = -4", is_correct: false },
          { text: "y = 8", is_correct: false },
        ],
      },
    ],
    Mechanics: [
      {
        text: "What is Newton's First Law?",
        choices: [
          {
            text: "An object remains at rest or in motion unless acted upon by a force",
            is_correct: true,
          },
          { text: "Force equals mass times acceleration", is_correct: false },
          {
            text: "Every action has an equal and opposite reaction",
            is_correct: false,
          },
          { text: "Energy cannot be created or destroyed", is_correct: false },
        ],
      },
    ],
    "Organic Chemistry": [
      {
        text: "What is the molecular formula for methane?",
        choices: [
          { text: "CH₄", is_correct: true },
          { text: "CO₂", is_correct: false },
          { text: "H₂O", is_correct: false },
          { text: "C₂H₆", is_correct: false },
        ],
      },
    ],
  },
};

const clearDatabase = async () => {
  await Promise.all([
    User.deleteMany({}),
    Subject.deleteMany({}),
    Category.deleteMany({}),
    Question.deleteMany({}),
    Choice.deleteMany({}),
    Quiz.deleteMany({}),
    QuizQuestion.deleteMany({}),
  ]);
  console.log("Database cleared");
};

const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    // Create subjects
    const subjectDocs = await Subject.insertMany(
      sampleData.subjects.map((subject) => ({
        name: subject.name.toLowerCase(),
      }))
    );
    console.log("Subjects created");

    // Create categories
    const categoryDocs = [];
    for (const subject of subjectDocs) {
      const subjectCategories =
        sampleData.categories[
          Object.keys(sampleData.categories).find(
            (key) => key.toLowerCase() === subject.name
          )
        ];

      const categories = await Category.insertMany(
        subjectCategories.map((category) => ({
          name: category.name.toLowerCase(),
          subject_id: subject._id,
        }))
      );
      categoryDocs.push(...categories);
    }
    console.log("Categories created");

    // Create questions and choices
    const questionDocs = [];
    for (const category of categoryDocs) {
      const categoryQuestions =
        sampleData.questions[
          Object.keys(sampleData.questions).find(
            (key) => key.toLowerCase() === category.name
          )
        ];

      if (categoryQuestions) {
        for (const questionData of categoryQuestions) {
          const question = await Question.create({
            text: questionData.text,
            category_id: category._id,
          });
          questionDocs.push(question);

          await Choice.insertMany(
            questionData.choices.map((choice) => ({
              ...choice,
              question_id: question._id,
            }))
          );
        }
      }
    }
    console.log("Questions and choices created");

    // Create multiple quizzes
    const quizzes = await Quiz.create([
      { name: "Mathematics Basics" },
      { name: "Physics Fundamentals" },
      { name: "Chemistry Essentials" },
    ]);

    // Create quiz questions for each quiz
    for (const quiz of quizzes) {
      // Randomly select 5 questions for each quiz
      const selectedQuestions = questionDocs
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(5, questionDocs.length));

      await QuizQuestion.insertMany(
        selectedQuestions.map((question, index) => ({
          quiz_id: quiz._id,
          question_id: question._id,
          position: index + 1,
        }))
      );
    }

    console.log("Sample quizzes created");
    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
