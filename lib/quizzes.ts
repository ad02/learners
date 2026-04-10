export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizData {
  moduleId: string;
  lessonId: string;
  moduleOrder: number;
  lessonOrder: number;
  questions: QuizQuestion[];
}

const quizzes: Record<string, QuizData> = {
  "01-vs-code": {
    moduleId: "01-vs-code",
    lessonId: "05-quiz",
    moduleOrder: 1,
    lessonOrder: 5,
    questions: [
      {
        question: "What is VS Code?",
        options: [
          "A web browser",
          "A code editor",
          "An operating system",
          "A programming language",
        ],
        correct: 1,
        explanation:
          "VS Code (Visual Studio Code) is a free code editor made by Microsoft — like Microsoft Word but for writing code.",
      },
      {
        question: "What is the terminal?",
        options: [
          "A type of monitor",
          "A place to type commands to your computer",
          "A web browser plugin",
          "A file format",
        ],
        correct: 1,
        explanation:
          "The terminal is where you type commands — like texting your computer instead of clicking buttons.",
      },
      {
        question: "What does a file extension tell you?",
        options: [
          "How big the file is",
          "When the file was created",
          "What kind of file it is",
          "Who created the file",
        ],
        correct: 2,
        explanation:
          "The extension (like .txt, .html, .js) tells your computer what kind of file it is and how to open it.",
      },
      {
        question: "How do you open the terminal in VS Code?",
        options: [
          "File > New Window",
          "Press Ctrl + backtick",
          "Click the blue button",
          "Right-click the desktop",
        ],
        correct: 1,
        explanation:
          "Press Ctrl + backtick (the key below Escape) to open VS Code's built-in terminal.",
      },
      {
        question: "What is a folder also called?",
        options: ["A container", "A directory", "A package", "A module"],
        correct: 1,
        explanation:
          "Folders are also called directories — they hold files and other folders, like a filing cabinet.",
      },
    ],
  },
  "02-git": {
    moduleId: "02-git",
    lessonId: "05-quiz",
    moduleOrder: 2,
    lessonOrder: 5,
    questions: [
      {
        question: "What is Git?",
        options: [
          "A website",
          "A version control system",
          "A programming language",
          "A code editor",
        ],
        correct: 1,
        explanation:
          "Git is a version control system — like a time machine that remembers every version of your project.",
      },
      {
        question: "What does 'git commit' do?",
        options: [
          "Deletes your files",
          "Saves a checkpoint of your changes",
          "Uploads to the internet",
          "Opens a new file",
        ],
        correct: 1,
        explanation:
          "A commit is like sealing an envelope — it saves a snapshot of your changes with a message describing what you did.",
      },
      {
        question: "What is GitHub?",
        options: [
          "A code editor",
          "A search engine",
          "A place to store code online",
          "An operating system",
        ],
        correct: 2,
        explanation:
          "GitHub is like Google Drive but for code — it stores your projects online so they're safe and shareable.",
      },
      {
        question: "What is a branch in Git?",
        options: [
          "A copy of your project to work on safely",
          "A type of file",
          "A Git error",
          "A terminal command",
        ],
        correct: 0,
        explanation:
          "A branch is like a parallel universe for your code — you can make changes without affecting the main version.",
      },
      {
        question: "What does 'git push' do?",
        options: [
          "Downloads files",
          "Sends your commits to GitHub",
          "Creates a new file",
          "Deletes a branch",
        ],
        correct: 1,
        explanation:
          "Push sends your committed changes to GitHub — like mailing your sealed envelope to the post office.",
      },
    ],
  },
};

export function getQuizData(moduleSlug: string): QuizData | null {
  return quizzes[moduleSlug] || null;
}
