import { render, screen, fireEvent } from "@testing-library/react";
import { Terminal } from "@/components/interactive/Terminal";

const sampleSteps = [
  {
    prompt: "~/project $",
    expectedCommands: ["mkdir my-project", "mkdir my-project/"],
    response: "Directory created: my-project/",
    hint: "Create a new folder called my-project",
  },
  {
    prompt: "~/project $",
    expectedCommands: ["cd my-project", "cd my-project/"],
    response: "Now in ~/project/my-project",
    hint: "Navigate into the my-project folder",
  },
];

describe("Terminal", () => {
  test("renders with prompt and input", () => {
    render(<Terminal steps={sampleSteps} />);
    expect(screen.getByText("~/project $")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("accepts correct command and shows response", () => {
    render(<Terminal steps={sampleSteps} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "mkdir my-project" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Directory created: my-project/")).toBeInTheDocument();
  });

  test("shows error for wrong command", () => {
    render(<Terminal steps={sampleSteps} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "wrong command" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
  });

  test("shows hint when hint button clicked", () => {
    render(<Terminal steps={sampleSteps} />);
    fireEvent.click(screen.getByText("Hint"));
    expect(screen.getByText(/Create a new folder/)).toBeInTheDocument();
  });
});
