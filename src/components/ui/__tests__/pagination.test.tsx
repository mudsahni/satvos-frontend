import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../pagination";

describe("Pagination", () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    total: 100,
    pageSize: 20,
    onPageChange: vi.fn(),
  };

  it("renders page info text", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Showing 1/)).toBeInTheDocument();
    expect(screen.getByText(/of 100/)).toBeInTheDocument();
  });

  it("renders correct page info for middle page", () => {
    render(<Pagination {...defaultProps} page={3} />);
    expect(screen.getByText(/Showing 41/)).toBeInTheDocument();
    expect(screen.getByText(/of 100/)).toBeInTheDocument();
  });

  it("renders correct page info for last page with partial results", () => {
    render(<Pagination {...defaultProps} total={50} totalPages={3} page={3} />);
    expect(screen.getByText(/Showing 41/)).toBeInTheDocument();
    expect(screen.getByText(/of 50/)).toBeInTheDocument();
  });

  it("renders page buttons", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 5")).toBeInTheDocument();
  });

  it("highlights the current page", () => {
    render(<Pagination {...defaultProps} page={2} />);
    expect(screen.getByLabelText("Page 2")).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText("Page 1")).not.toHaveAttribute("aria-current");
  });

  it("disables Prev and First on page 1", () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(screen.getByLabelText("First page")).toBeDisabled();
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables Next and Last on last page", () => {
    render(<Pagination {...defaultProps} page={5} />);
    expect(screen.getByLabelText("Next page")).toBeDisabled();
    expect(screen.getByLabelText("Last page")).toBeDisabled();
  });

  it("enables all nav buttons on a middle page", () => {
    render(<Pagination {...defaultProps} page={3} />);
    expect(screen.getByLabelText("First page")).not.toBeDisabled();
    expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
    expect(screen.getByLabelText("Next page")).not.toBeDisabled();
    expect(screen.getByLabelText("Last page")).not.toBeDisabled();
  });

  it("calls onPageChange with correct page on Next click", async () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={2} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with correct page on Prev click", async () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText("Previous page"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with 1 on First click", async () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText("First page"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange with totalPages on Last click", async () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={2} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText("Last page"));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it("calls onPageChange on page number click", async () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={1} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText("Page 4"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("returns null when totalPages <= 1 and no onPageSizeChange", () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={1} total={5} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when totalPages is 0 and no onPageSizeChange", () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={0} total={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when totalPages <= 1 but onPageSizeChange is provided", () => {
    const { container } = render(
      <Pagination
        {...defaultProps}
        totalPages={1}
        total={5}
        onPageSizeChange={vi.fn()}
      />
    );
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText(/per page/)).toBeInTheDocument();
  });

  it("hides navigation buttons when totalPages <= 1", () => {
    render(
      <Pagination
        {...defaultProps}
        totalPages={1}
        total={5}
        onPageSizeChange={vi.fn()}
      />
    );
    expect(screen.queryByLabelText("First page")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
  });

  it("shows ellipsis for many pages", () => {
    render(<Pagination {...defaultProps} totalPages={10} total={200} page={5} />);
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(2);
    expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 6")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 10")).toBeInTheDocument();
  });

  it("shows no ellipsis when total pages <= 7", () => {
    render(<Pagination {...defaultProps} totalPages={7} total={140} page={4} />);
    expect(screen.queryByText("...")).not.toBeInTheDocument();
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByLabelText(`Page ${i}`)).toBeInTheDocument();
    }
  });

  it("shows ellipsis only on right when near start", () => {
    render(<Pagination {...defaultProps} totalPages={10} total={200} page={2} />);
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(1);
    expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 10")).toBeInTheDocument();
  });

  it("shows ellipsis only on left when near end", () => {
    render(<Pagination {...defaultProps} totalPages={10} total={200} page={9} />);
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(1);
    expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 7")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 8")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 9")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 10")).toBeInTheDocument();
  });

  describe("page size selector", () => {
    it("does not render page size selector without onPageSizeChange", () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.queryByText(/per page/)).not.toBeInTheDocument();
    });

    it("renders page size selector with onPageSizeChange", () => {
      render(
        <Pagination {...defaultProps} onPageSizeChange={vi.fn()} />
      );
      expect(screen.getByText(/per page/)).toBeInTheDocument();
      expect(screen.getByLabelText("Rows per page")).toBeInTheDocument();
    });
  });
});
