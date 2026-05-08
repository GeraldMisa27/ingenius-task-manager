/**
 * Database seed for development.
 *
 * Creates a small but realistic dataset:
 *  - 3 users with bcrypt-hashed passwords.
 *  - 2 projects: one active, one archived.
 *  - 2 ProjectMember entries (membership relations).
 *  - 6 tasks distributed across projects, statuses, priorities, and assignees.
 *
 * Idempotent: clears existing data before inserting, in FK-safe order.
 *
 * Run with: pnpm db:seed
 */

import { PrismaClient, TaskStatus, TaskPriority } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in FK-safe order.
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Hash a single demo password for all users (development only).
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // Create users.
  const alice = await prisma.user.create({
    data: {
      name: "Alice Owner",
      email: "alice@demo.local",
      passwordHash,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Member",
      email: "bob@demo.local",
      passwordHash,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Member",
      email: "carol@demo.local",
      passwordHash,
    },
  });

  // Create active project owned by Alice with Bob and Carol as members.
  const activeProject = await prisma.project.create({
    data: {
      name: "Lanzamiento del producto",
      description: "Coordinación general del lanzamiento Q4.",
      ownerId: alice.id,
      archived: false,
      members: {
        create: [{ userId: bob.id }, { userId: carol.id }],
      },
    },
  });

  // Create archived project owned by Alice (no other members).
  const archivedProject = await prisma.project.create({
    data: {
      name: "Migración legacy",
      description: "Proyecto cerrado tras la migración exitosa.",
      ownerId: alice.id,
      archived: true,
    },
  });

  // Create tasks for the active project.
  await prisma.task.createMany({
    data: [
      {
        name: "Definir cronograma de lanzamiento",
        projectId: activeProject.id,
        creatorId: alice.id,
        assigneeId: alice.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      },
      {
        name: "Preparar materiales de marketing",
        projectId: activeProject.id,
        creatorId: bob.id,
        assigneeId: bob.id,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
      },
      {
        name: "Revisar checklist de QA",
        projectId: activeProject.id,
        creatorId: carol.id,
        assigneeId: carol.id,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
      },
      {
        name: "Sincronizar con equipo legal",
        projectId: activeProject.id,
        creatorId: alice.id,
        assigneeId: bob.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.LOW,
      },
    ],
  });

  // Create tasks for the archived project (read-only context for testing).
  await prisma.task.createMany({
    data: [
      {
        name: "Apagar instancias antiguas",
        projectId: archivedProject.id,
        creatorId: alice.id,
        assigneeId: alice.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
      },
      {
        name: "Documentar lecciones aprendidas",
        projectId: archivedProject.id,
        creatorId: alice.id,
        assigneeId: alice.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.LOW,
      },
    ],
  });

  console.log("Seed completed:");
  console.log("  Users: 3 (alice, bob, carol — password: demo1234)");
  console.log("  Projects: 1 active + 1 archived");
  console.log("  Tasks: 6 total");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
