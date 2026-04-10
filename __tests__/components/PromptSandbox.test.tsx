import { render, screen, fireEvent } from "@testing-library/react";
import { PromptSandbox } from "@/components/interactive/PromptSandbox";

describe("PromptSandbox", () => {
  test("renders with empty textarea", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByPlaceholderText(/write your prompt/i)).toBeInTheDocument();
  });

  test("shows scoring criteria labels", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByText(/context/i)).toBeInTheDocument();
    expect(screen.getByText(/task/i)).toBeInTheDocument();
    expect(screen.getByText(/format/i)).toBeInTheDocument();
  });

  test("scores prompt when check button clicked", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    fireEvent.change(textarea, {
      target: { value: "You are a professional copywriter. I need a blog post about automation for my company website. Write a 500-word article with headers and bullet points." },
    });
    fireEvent.click(screen.getByText(/check/i));
    expect(screen.getByText(/\/10/)).toBeInTheDocument();
  });

  test("shows bad example when provided", () => {
    render(<PromptSandbox exercise="test" badExample="Write about dogs" />);
    expect(screen.getByText("Write about dogs")).toBeInTheDocument();
  });
});
