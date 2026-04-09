import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/layout/ProgressBar";

describe("ProgressBar", () => {
  test("renders with correct percentage", () => {
    render(<ProgressBar current={3} total={9} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "33"
    );
  });

  test("shows label when provided", () => {
    render(<ProgressBar current={3} total={9} showLabel />);
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  test("handles zero total", () => {
    render(<ProgressBar current={0} total={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });
});
