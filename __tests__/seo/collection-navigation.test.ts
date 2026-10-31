import { describe, it, expect } from "vitest";
import { collectionNavigation, populatedCollectionNavigation } from "@/lib/collection-navigation";

describe("public collection navigation", () => {
  it("excludes inactive, hidden and synthetic collections without dropping new collections", () => {
    const result = collectionNavigation(["", "ems", "hidden-test", "home-services", "yoga-pilates", "new-products"].map(handle => ({handle, title: handle})), "en");
    expect(result.map(item => item.href)).toEqual(["/en/collections/new-products"]);
  });
  it("canonicalizes Arabic handles and deduplicates while keeping localized links", () => {
    const result = collectionNavigation([
      {handle: "حلول-تكنولوجيا-المياه-والتربة", title: "Water"},
      {handle: "water-soil-technology-solutions", title: "Water"},
      {handle: "amazing-thai-products", title: "Health"},
    ], "ar");
    expect(result.map(item => item.title)).toEqual(["الصحة والجمال", "المياه والتربة"]);
    expect(result[1].href).toBe("/ar/collections/water-soil-technology-solutions");
  });
});

it("only shows collections with visible products and tolerates an unavailable collection", async () => {
  const result = await populatedCollectionNavigation(
    ["empty", "populated", "unavailable"].map(handle => ({ handle, title: handle })), "en",
    async handle => { if (handle === "unavailable") throw new Error("unavailable"); return handle === "populated" ? [{}] : []; },
  );
  expect(result.map(item => item.handle)).toEqual(["populated"]);
});
