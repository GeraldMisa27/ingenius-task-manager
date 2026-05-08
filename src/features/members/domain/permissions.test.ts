import { describe, it, expect } from "vitest";
import {
  canAddMember,
  canRemoveMember,
  canExecuteOwnershipTransfer,
} from "./permissions";

describe("canAddMember", () => {
  it("allows the owner in active project", () => {
    expect(canAddMember("owner", false)).toBe(true);
  });

  it("denies the owner in archived project", () => {
    expect(canAddMember("owner", true)).toBe(false);
  });

  it("denies non-owners always", () => {
    expect(canAddMember("member", false)).toBe(false);
    expect(canAddMember("outsider", false)).toBe(false);
  });
});

describe("canRemoveMember", () => {
  const ownerId = "u-owner";

  it("allows the owner to remove a regular member", () => {
    expect(canRemoveMember("owner", "u-other", ownerId, false)).toBe(true);
  });

  it("denies the owner from removing themselves", () => {
    expect(canRemoveMember("owner", ownerId, ownerId, false)).toBe(false);
  });

  it("denies non-owners from removing anyone", () => {
    expect(canRemoveMember("member", "u-other", ownerId, false)).toBe(false);
    expect(canRemoveMember("outsider", "u-other", ownerId, false)).toBe(false);
  });

  it("denies removal in archived projects", () => {
    expect(canRemoveMember("owner", "u-other", ownerId, true)).toBe(false);
  });
});

describe("canExecuteOwnershipTransfer", () => {
  it("allows the owner when there are candidate members", () => {
    expect(canExecuteOwnershipTransfer("owner", [{ userId: "u-1" }], false)).toBe(true);
  });

  it("denies the owner when there are no candidates", () => {
    expect(canExecuteOwnershipTransfer("owner", [], false)).toBe(false);
  });

  it("denies non-owners always", () => {
    expect(canExecuteOwnershipTransfer("member", [{ userId: "u-1" }], false)).toBe(false);
    expect(canExecuteOwnershipTransfer("outsider", [{ userId: "u-1" }], false)).toBe(false);
  });

  it("denies in archived projects", () => {
    expect(canExecuteOwnershipTransfer("owner", [{ userId: "u-1" }], true)).toBe(false);
  });
});
