import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchBox } from "@/components/dashboard/search-box";

describe("SearchBox", () => {
  it("updates value through onChange", () => {
    const onChange = vi.fn();
    render(<SearchBox value="" onChange={onChange} />);
    const input = screen.getByRole("searchbox", { name: /search documents/i });
    fireEvent.change(input, { target: { value: "notes" } });
    expect(onChange).toHaveBeenCalledWith("notes");
  });
});
