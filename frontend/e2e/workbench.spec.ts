import { test, expect } from "@playwright/test";
async function scenario(
  page: import("@playwright/test").Page,
  title = "E2E educational pilot",
) {
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "New scenario" })
    .click();
  await page.getByLabel("Decision title", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Run board assessment" }).click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
}
test("board, intake, dissent, export and decision history", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Five perspectives/ }),
  ).toBeVisible();
  await scenario(page);
  await page.getByRole("tab", { name: "Advisor perspectives" }).click();
  await expect(
    page.getByRole("heading", { name: "Mission", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Deliberation & dissent" }).click();
  await expect(
    page.getByRole("heading", { name: "Dissent register" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Evidence & risks" }).click();
  await expect(
    page.getByRole("heading", { name: "Source-of-truth snapshot" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  expect((await download).suggestedFilename()).toContain("tom-advisory");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Decision history" })
    .click();
  await expect(
    page.getByRole("cell", { name: /^E2E educational pilot/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "E2E educational pilot", exact: true }),
  ).toBeVisible();
});
test("compare two scenarios without losing dissent", async ({ page }) => {
  await page.goto("/");
  await scenario(page, "Pilot A");
  await scenario(page, "Pilot B");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Decision history" })
    .click();
  await page.getByRole("checkbox", { name: "Compare Pilot A" }).check();
  await page.getByRole("checkbox", { name: "Compare Pilot B" }).check();
  await page.getByRole("button", { name: "Compare two reports" }).click();
  await expect(
    page.getByRole("heading", { name: "Approval conditions" }),
  ).toHaveCount(2);
});
test("source register clearly labels fiction and does not allow anonymous uploads", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Source register" })
    .click();
  await expect(
    page.getByRole("cell", { name: "simulated", exact: true }),
  ).toHaveCount(9);
  await expect(page.getByText("Uploads require the backend.")).toBeVisible();
});
test("actual backend connection, execution and upload rejection", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Backend connection", exact: true })
    .click();
  await page.getByLabel("API base URL").fill("http://127.0.0.1:18000");
  await page
    .getByRole("button", { name: "Connect backend", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Backend connected");
  await scenario(page, "Connected E2E pilot");
  await page.getByRole("tab", { name: "Roadmap & metrics" }).click();
  await expect(
    page.getByRole("heading", { name: "Measurement framework" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Source register" })
    .click();
  await page.getByLabel("Source file").setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Missing metadata"),
  });
  await page.getByRole("button", { name: "Upload and index" }).click();
  await expect(page.getByRole("alert")).toContainText("422");
});
test("mobile navigation and intake remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scenario(page, "Mobile pilot");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Manage connection" }).click();
  await expect(
    page.getByRole("heading", { name: "Connect the intelligence." }),
  ).toBeVisible();
});
