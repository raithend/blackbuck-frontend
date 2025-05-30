import Page from "@/app/(app)/page";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("Page", () => {
	render(<Page />);
	expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeDefined();
});
