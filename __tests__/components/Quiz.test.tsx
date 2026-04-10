import { render, screen, fireEvent } from "@testing-library/react";
import { Quiz } from "@/components/interactive/Quiz";

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
) as jest.Mock;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

const sampleQuestions = [
  {
    question: "What does VS Code stand for?",
    options: [
      "Visual Studio Code",
      "Very Simple Code",
      "Virtual System Code",
      "Video Source Code",
    ],
    correct: 0,
    explanation:
      "VS Code stands for Visual Studio Code — a free code editor by Microsoft.",
  },
  {
    question: "What is the terminal?",
    options: [
      "A type of computer",
      "A place to type commands",
      "A web browser",
      "A file type",
    ],
    correct: 1,
    explanation:
      "The terminal is where you type commands to communicate with your computer.",
  },
];

describe("Quiz", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test("renders first question", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    expect(
      screen.getByText("What does VS Code stand for?")
    ).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
  });

  test("shows all 4 options", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    expect(screen.getByText("Visual Studio Code")).toBeInTheDocument();
    expect(screen.getByText("Very Simple Code")).toBeInTheDocument();
  });

  test("shows correct feedback on right answer", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    fireEvent.click(screen.getByText("Visual Studio Code"));
    expect(screen.getByText(/VS Code stands for/)).toBeInTheDocument();
  });

  test("shows incorrect feedback on wrong answer", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    fireEvent.click(screen.getByText("Very Simple Code"));
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
  });

  test("advances to next question", () => {
    render(
      <Quiz
        questions={sampleQuestions}
        moduleId="01-vs-code"
        lessonId="05-quiz"
        moduleOrder={1}
        lessonOrder={5}
      />
    );
    fireEvent.click(screen.getByText("Visual Studio Code"));
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("What is the terminal?")).toBeInTheDocument();
  });
});
