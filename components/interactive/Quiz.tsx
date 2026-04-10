"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  moduleId: string;
  lessonId: string;
  moduleOrder: number;
  lessonOrder: number;
}

export function Quiz({
  questions,
  moduleId,
  lessonId,
  moduleOrder,
  lessonOrder,
}: QuizProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-xl p-6 mt-6 text-accent-red text-sm border border-red-200">
        Quiz error: questions data not loaded. Check MDX content.
      </div>
    );
  }

  const current = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedOption === current.correct;
  const hasAnswered = selectedOption !== null;

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= 80;

  function handleSelect(optionIndex: number) {
    if (hasAnswered) return;
    setSelectedOption(optionIndex);
    if (optionIndex === current.correct) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      setShowResult(true);
      // Save score
      // correctCount already incremented in handleSelect
      const finalPercent = Math.round((correctCount / questions.length) * 100);
      fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          lessonId,
          moduleOrder,
          lessonOrder,
          quizScore: finalPercent,
        }),
      }).then(() => router.refresh());
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
  }

  function handleRetry() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setShowResult(false);
  }

  if (showResult) {
    return (
      <div className="rounded-2xl bg-white shadow-lg p-8 text-center border border-border">
        <h2 className="mb-4 text-2xl font-bold text-text-primary">
          Quiz Complete!
        </h2>
        <p className="mb-2 text-4xl font-bold gradient-text">
          {scorePercent}%
        </p>
        <p className="mb-6 text-text-secondary">
          You got {correctCount} out of {questions.length} correct.
        </p>
        {passed ? (
          <>
            <p className="mb-4 text-lg font-semibold text-accent-green">
              Great job! You passed!
            </p>
            <a
              href="/dashboard"
              className="inline-block rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg"
            >
              Back to Dashboard
            </a>
          </>
        ) : (
          <>
            <p className="mb-4 text-lg font-semibold text-accent-red">
              Let&apos;s try again
            </p>
            <button
              onClick={handleRetry}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg"
            >
              Retry Quiz
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-lg p-6 border border-border">
      <div className="mb-4 text-sm font-medium text-text-secondary">
        Question {currentIndex + 1} of {questions.length}
      </div>

      <h3 className="mb-6 text-xl font-semibold text-text-primary">
        {current.question}
      </h3>

      <div className="mb-6 space-y-3">
        {current.options.map((option, i) => {
          let optionClasses =
            "w-full rounded-xl border px-4 py-3 text-left transition-all ";

          if (!hasAnswered) {
            optionClasses +=
              "border-gray-200 bg-gray-50 text-text-primary hover:border-accent-blue hover:bg-blue-50 cursor-pointer";
          } else if (i === current.correct) {
            optionClasses +=
              "border-accent-green bg-green-50 text-accent-green font-medium";
          } else if (i === selectedOption) {
            optionClasses +=
              "border-accent-red bg-red-50 text-accent-red";
          } else {
            optionClasses +=
              "border-gray-200 bg-gray-50 text-text-muted opacity-50";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={hasAnswered}
              className={optionClasses}
            >
              {option}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="mb-6">
          {isCorrect ? (
            <div className="rounded-xl border border-accent-green bg-green-50 p-4">
              <p className="font-medium text-accent-green">Correct!</p>
              <p className="mt-1 text-sm text-text-secondary">
                {current.explanation}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-accent-red bg-red-50 p-4">
              <p className="font-medium text-accent-red">Not quite!</p>
              <p className="mt-1 text-sm text-text-secondary">
                {current.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {hasAnswered && (
        <button
          onClick={handleNext}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg"
        >
          {isLastQuestion ? "See Results" : "Next"}
        </button>
      )}
    </div>
  );
}
