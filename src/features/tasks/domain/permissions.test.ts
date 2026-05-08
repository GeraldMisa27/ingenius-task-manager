import { describe, it, expect } from "vitest";
import {
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canReassignTask,
  canViewTasks,
} from "./permissions";
import type { TaskLike } from "./types";

const ownTask: TaskLike = {
  id: "t1",
  projectId: "p1",
  assigneeId: "u-creator",
  creatorId: "u-creator",
};

const otherUserTask: TaskLike = {
  id: "t2",
  projectId: "p1",
  assigneeId: "u-other",
  creatorId: "u-other",
};

describe("canCreateTask", () => {
  it("allows owner and member in active project", () => {
    expect(canCreateTask("owner", false)).toBe(true);
    expect(canCreateTask("member", false)).toBe(true);
  });

  it("denies in archived project regardless of role", () => {
    expect(canCreateTask("owner", true)).toBe(false);
    expect(canCreateTask("member", true)).toBe(false);
  });

  it("denies outsiders always", () => {
    expect(canCreateTask("outsider", false)).toBe(false);
    expect(canCreateTask("outsider", true)).toBe(false);
  });
});

describe("canEditTask", () => {
  it("allows the task creator to edit their own task", () => {
    expect(canEditTask("member", ownTask, "u-creator", false)).toBe(true);
  });

  it("allows the project owner to edit any task in the project", () => {
    expect(canEditTask("owner", otherUserTask, "u-owner", false)).toBe(true);
  });

  it("denies a member from editing another user's task", () => {
    expect(canEditTask("member", otherUserTask, "u-creator", false)).toBe(false);
  });

  it("denies all editing in archived projects, even to the owner", () => {
    expect(canEditTask("owner", ownTask, "u-owner", true)).toBe(false);
    expect(canEditTask("member", ownTask, "u-creator", true)).toBe(false);
  });

  it("denies outsiders from editing", () => {
    expect(canEditTask("outsider", ownTask, "u-creator", false)).toBe(false);
  });
});

describe("canDeleteTask", () => {
  it("follows the same rules as canEditTask", () => {
    expect(canDeleteTask("member", ownTask, "u-creator", false)).toBe(true);
    expect(canDeleteTask("owner", otherUserTask, "u-owner", false)).toBe(true);
    expect(canDeleteTask("member", otherUserTask, "u-creator", false)).toBe(false);
    expect(canDeleteTask("owner", ownTask, "u-owner", true)).toBe(false);
  });
});

describe("canReassignTask", () => {
  it("allows only the project owner", () => {
    expect(canReassignTask("owner")).toBe(true);
    expect(canReassignTask("member")).toBe(false);
    expect(canReassignTask("outsider")).toBe(false);
  });
});

describe("canViewTasks", () => {
  it("allows owner and member", () => {
    expect(canViewTasks("owner")).toBe(true);
    expect(canViewTasks("member")).toBe(true);
  });

  it("denies outsider", () => {
    expect(canViewTasks("outsider")).toBe(false);
  });
});
