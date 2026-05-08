import { describe, it, expect } from "vitest";
import {
  canEditProject,
  canArchiveProject,
  canUnarchiveProject,
  canDeleteProject,
  canTransferOwnership,
  canViewProject,
} from "./permissions";
import type { ProjectLike } from "./types";

const activeProject: ProjectLike = {
  id: "p1",
  ownerId: "u1",
  archived: false,
};

const archivedProject: ProjectLike = {
  id: "p1",
  ownerId: "u1",
  archived: true,
};

describe("canEditProject", () => {
  it("allows the owner to edit an active project", () => {
    expect(canEditProject("owner", activeProject)).toBe(true);
  });

  it("denies the owner to edit an archived project", () => {
    expect(canEditProject("owner", archivedProject)).toBe(false);
  });

  it("denies a member from editing", () => {
    expect(canEditProject("member", activeProject)).toBe(false);
  });

  it("denies an outsider from editing", () => {
    expect(canEditProject("outsider", activeProject)).toBe(false);
  });
});

describe("canArchiveProject", () => {
  it("allows the owner to archive an active project", () => {
    expect(canArchiveProject("owner", activeProject)).toBe(true);
  });

  it("denies archiving an already archived project", () => {
    expect(canArchiveProject("owner", archivedProject)).toBe(false);
  });

  it("denies non-owners from archiving", () => {
    expect(canArchiveProject("member", activeProject)).toBe(false);
    expect(canArchiveProject("outsider", activeProject)).toBe(false);
  });
});

describe("canUnarchiveProject", () => {
  it("allows the owner to unarchive an archived project", () => {
    expect(canUnarchiveProject("owner", archivedProject)).toBe(true);
  });

  it("denies unarchiving a non-archived project", () => {
    expect(canUnarchiveProject("owner", activeProject)).toBe(false);
  });

  it("denies non-owners from unarchiving", () => {
    expect(canUnarchiveProject("member", archivedProject)).toBe(false);
    expect(canUnarchiveProject("outsider", archivedProject)).toBe(false);
  });
});

describe("canDeleteProject", () => {
  it("allows the owner to delete an active project", () => {
    expect(canDeleteProject("owner", activeProject)).toBe(true);
  });

  it("denies deleting an archived project (must unarchive first)", () => {
    expect(canDeleteProject("owner", archivedProject)).toBe(false);
  });

  it("denies non-owners from deleting", () => {
    expect(canDeleteProject("member", activeProject)).toBe(false);
    expect(canDeleteProject("outsider", activeProject)).toBe(false);
  });
});

describe("canTransferOwnership", () => {
  it("allows the owner to transfer in an active project", () => {
    expect(canTransferOwnership("owner", activeProject)).toBe(true);
  });

  it("denies transferring in an archived project", () => {
    expect(canTransferOwnership("owner", archivedProject)).toBe(false);
  });

  it("denies non-owners from transferring", () => {
    expect(canTransferOwnership("member", activeProject)).toBe(false);
    expect(canTransferOwnership("outsider", activeProject)).toBe(false);
  });
});

describe("canViewProject", () => {
  it("allows owners and members to view", () => {
    expect(canViewProject("owner")).toBe(true);
    expect(canViewProject("member")).toBe(true);
  });

  it("denies outsiders from viewing", () => {
    expect(canViewProject("outsider")).toBe(false);
  });
});
