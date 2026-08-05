import { test, expect, type Page, type Locator } from "@playwright/test";

function column(page: Page, title: string): Locator {
  return page.locator(`[data-column-title="${title}"]`);
}

function card(page: Page, title: string): Locator {
  return page.locator(`[data-card-title="${title}"]`);
}

async function dragCardToColumn(page: Page, source: Locator, targetColumn: Locator) {
  const from = await source.boundingBox();
  const to = await targetColumn.boundingBox();
  if (!from || !to) throw new Error("missing bounding box");

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  // dnd-kit needs several moves past its activation distance.
  const steps = 8;
  const targetX = to.x + to.width / 2;
  const targetY = to.y + 40;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      from.x + ((targetX - from.x) * i) / steps,
      from.y + ((targetY - from.y) * i) / steps
    );
  }
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("renders the board with five seeded columns and cards", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Kanban Board", level: 1 })).toBeVisible();
  await expect(page.getByTestId("column")).toHaveCount(5);
  expect(await page.getByTestId("card").count()).toBeGreaterThan(0);
  await expect(card(page, "Define product vision")).toBeVisible();
});

test("adds a new card to a column", async ({ page }) => {
  const backlog = column(page, "Backlog");
  await backlog.getByRole("button", { name: "Add a card" }).click();
  await backlog.getByLabel("Card title").fill("Write launch email");
  await backlog.getByLabel("Card details").fill("Draft copy for the announcement.");
  await backlog.getByRole("button", { name: "Add card" }).click();

  await expect(card(page, "Write launch email")).toBeVisible();
});

test("deletes a card", async ({ page }) => {
  const target = card(page, "Competitive research");
  await expect(target).toBeVisible();
  await target.hover();
  await target.getByRole("button", { name: /Delete card/ }).click();
  await expect(card(page, "Competitive research")).toHaveCount(0);
});

test("renames a column", async ({ page }) => {
  const review = column(page, "Review");
  await review.getByRole("button", { name: "Review", exact: true }).click();
  const input = review.getByRole("textbox", { name: /Rename column/ });
  await input.fill("QA");
  await input.press("Enter");

  await expect(column(page, "QA")).toBeVisible();
  await expect(column(page, "Review")).toHaveCount(0);
});

test("drags a card from Backlog into To Do", async ({ page }) => {
  await dragCardToColumn(page, card(page, "Set up analytics"), column(page, "To Do"));

  await expect(column(page, "To Do").locator('[data-card-title="Set up analytics"]')).toBeVisible();
  await expect(
    column(page, "Backlog").locator('[data-card-title="Set up analytics"]')
  ).toHaveCount(0);
});
