import { render, screen } from "@testing-library/react";
import { ModuleCard } from "@/components/layout/ModuleCard";

jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe("ModuleCard", () => {
  test("renders completed state", () => {
    render(
      <ModuleCard
        title="VS Code Basics"
        order={1}
        slug="01-vs-code"
        status="completed"
        lessonsCompleted={5}
        lessonCount={5}
      />
    );
    expect(screen.getByText("VS Code Basics")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("5/5 lessons")).toBeInTheDocument();
  });

  test("renders locked state with reduced opacity", () => {
    const { container } = render(
      <ModuleCard
        title="Git & GitHub"
        order={2}
        slug="02-git"
        status="locked"
        lessonsCompleted={0}
        lessonCount={5}
      />
    );
    expect(screen.getByText("LOCKED")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("opacity-50");
  });

  test("renders in-progress state", () => {
    render(
      <ModuleCard
        title="AI Prompting"
        order={3}
        slug="03-prompting"
        status="in-progress"
        lessonsCompleted={2}
        lessonCount={5}
      />
    );
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("2/5 lessons")).toBeInTheDocument();
  });

  test("locked card is not a link", () => {
    render(
      <ModuleCard
        title="Locked Module"
        order={4}
        slug="04-claude-code"
        status="locked"
        lessonsCompleted={0}
        lessonCount={5}
      />
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("available card is a link", () => {
    render(
      <ModuleCard
        title="Available Module"
        order={1}
        slug="01-vs-code"
        status="available"
        lessonsCompleted={0}
        lessonCount={5}
      />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/learn/01-vs-code");
  });
});
