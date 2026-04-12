import { render, screen, fireEvent } from "@testing-library/react";
import { PromptSandbox } from "@/components/interactive/PromptSandbox";

describe("PromptSandbox", () => {
  test("renders with empty textarea", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByPlaceholderText(/write your prompt/i)).toBeInTheDocument();
  });

  test("renders heading", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByText("Prompt Writing Exercise")).toBeInTheDocument();
  });

  test("renders check button", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByText(/check my prompt/i)).toBeInTheDocument();
  });

  test("shows scoring criteria labels", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Task")).toBeInTheDocument();
    expect(screen.getByText("Format")).toBeInTheDocument();
    expect(screen.getByText("Specificity")).toBeInTheDocument();
  });

  test("does not show score before checking", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
  });

  test("scores prompt when check button clicked", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    fireEvent.change(textarea, {
      target: { value: "You are a professional copywriter. I need a blog post about automation for my company website. Write a 500-word article with headers and bullet points." },
    });
    fireEvent.click(screen.getByText(/check my prompt/i));
    expect(screen.getByText(/\/10/)).toBeInTheDocument();
  });

  test("perfect prompt scores 10/10", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    // Hits all criteria: Role, Context (15+ words), Task, Format, Specificity (20+ words)
    fireEvent.change(textarea, {
      target: {
        value: "You are a senior marketing writer. I need this because we are launching a new product for my company next month. Write a detailed blog post with bullet points and headers covering the key features.",
      },
    });
    fireEvent.click(screen.getByText(/check my prompt/i));
    expect(screen.getByText("10/10")).toBeInTheDocument();
  });

  test("empty prompt scores 0/10", () => {
    render(<PromptSandbox exercise="test" />);
    fireEvent.click(screen.getByText(/check my prompt/i));
    expect(screen.getByText("0/10")).toBeInTheDocument();
  });

  test("short prompt missing all criteria scores low", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    fireEvent.change(textarea, { target: { value: "dogs" } });
    fireEvent.click(screen.getByText(/check my prompt/i));
    expect(screen.getByText("0/10")).toBeInTheDocument();
  });

  test("shows pass/fail feedback after checking", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    fireEvent.change(textarea, { target: { value: "Write a list of ideas" } });
    fireEvent.click(screen.getByText(/check my prompt/i));
    // Task passes ("Write"), Format passes ("list")
    expect(screen.getByText("You clearly stated a task.")).toBeInTheDocument();
    expect(screen.getByText("You specified an output format.")).toBeInTheDocument();
    // Role fails
    expect(screen.getByText(/Try assigning a role/)).toBeInTheDocument();
  });

  test("shows bad example when provided", () => {
    render(<PromptSandbox exercise="test" badExample="Write about dogs" />);
    expect(screen.getByText("Write about dogs")).toBeInTheDocument();
    expect(screen.getByText("Bad example:")).toBeInTheDocument();
  });

  test("does not show bad example section when not provided", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.queryByText("Bad example:")).not.toBeInTheDocument();
  });

  test("shows hint when provided", () => {
    render(<PromptSandbox exercise="test" hint="Include all 4 parts" />);
    expect(screen.getByText("Include all 4 parts")).toBeInTheDocument();
    expect(screen.getByText("Hint:")).toBeInTheDocument();
  });

  test("does not show hint section when not provided", () => {
    render(<PromptSandbox exercise="test" />);
    expect(screen.queryByText("Hint:")).not.toBeInTheDocument();
  });

  test("criteria badges show checkmarks after passing", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    fireEvent.change(textarea, {
      target: { value: "You are an expert. Write a summary in bullet points." },
    });
    fireEvent.click(screen.getByText(/check my prompt/i));
    // Role passes, Task passes, Format passes
    expect(screen.getByText(/✓ Role/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Task/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Format/)).toBeInTheDocument();
  });

  test("criteria badges show X marks after failing", () => {
    render(<PromptSandbox exercise="test" />);
    fireEvent.click(screen.getByText(/check my prompt/i));
    // All fail on empty prompt
    expect(screen.getByText(/✗ Role/)).toBeInTheDocument();
    expect(screen.getByText(/✗ Task/)).toBeInTheDocument();
    expect(screen.getByText(/✗ Format/)).toBeInTheDocument();
    expect(screen.getByText(/✗ Specificity/)).toBeInTheDocument();
  });

  test("textarea accepts user input", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    expect(textarea.value).toBe("Hello world");
  });

  test("re-checking updates the score", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);

    // First check: low score
    fireEvent.change(textarea, { target: { value: "dogs" } });
    fireEvent.click(screen.getByText(/check my prompt/i));
    expect(screen.getByText("0/10")).toBeInTheDocument();

    // Second check: better prompt
    fireEvent.change(textarea, {
      target: {
        value: "You are a senior marketing writer. I need this because we are launching a new product for my company next month. Write a detailed blog post with bullet points and headers covering the key features.",
      },
    });
    fireEvent.click(screen.getByText(/check my prompt/i));
    expect(screen.getByText("10/10")).toBeInTheDocument();
  });

  test("score color is green for high scores", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    fireEvent.change(textarea, {
      target: {
        value: "You are a senior marketing writer. I need this because we are launching a new product for my company next month. Write a detailed blog post with bullet points and headers covering the key features.",
      },
    });
    fireEvent.click(screen.getByText(/check my prompt/i));
    const scoreEl = screen.getByText("10/10");
    expect(scoreEl.className).toContain("text-accent-green");
  });

  test("score color is red for low scores", () => {
    render(<PromptSandbox exercise="test" />);
    fireEvent.click(screen.getByText(/check my prompt/i));
    const scoreEl = screen.getByText("0/10");
    expect(scoreEl.className).toContain("text-accent-red");
  });

  test("score color is yellow for medium scores", () => {
    render(<PromptSandbox exercise="test" />);
    const textarea = screen.getByPlaceholderText(/write your prompt/i);
    // Hits Role + Task only = 4/10
    fireEvent.change(textarea, { target: { value: "You are an expert. Write something." } });
    fireEvent.click(screen.getByText(/check my prompt/i));
    const scoreEl = screen.getByText("4/10");
    expect(scoreEl.className).toContain("text-accent-yellow");
  });

  test("unique textarea id per exercise", () => {
    const { container } = render(<PromptSandbox exercise="my-exercise" />);
    const textarea = container.querySelector("#prompt-my-exercise");
    expect(textarea).toBeInTheDocument();
  });
});
