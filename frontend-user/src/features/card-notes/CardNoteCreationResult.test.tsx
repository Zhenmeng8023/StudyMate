import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import { CardNoteCreationResult } from "./CardNoteCreationResult";

afterEach(cleanup);

it("keeps the success count and a precise review and source action", () => {
  const { rerender } = render(<MemoryRouter><CardNoteCreationResult result={null} /></MemoryRouter>);
  expect(screen.queryByLabelText("制卡完成")).not.toBeInTheDocument();
  rerender(<MemoryRouter><CardNoteCreationResult result={{ count: 2, cardId: "card /1", sourcePath: "/notes?selected=n1" }} /></MemoryRouter>);
  expect(screen.getByRole("status")).toHaveTextContent("已生成 2 张卡片。");
  expect(screen.getByRole("link", { name: "去复习" })).toHaveAttribute("href", "/review?card=card%20%2F1");
  expect(screen.getByRole("link", { name: "回到来源" })).toHaveAttribute("href", "/notes?selected=n1");
  rerender(<MemoryRouter><CardNoteCreationResult result={{ count: 1, sourcePath: "/ai" }} /></MemoryRouter>);
  expect(screen.getByRole("link", { name: "去复习" })).toHaveAttribute("href", "/review");
});
