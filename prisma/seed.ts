import "dotenv/config";

import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { prisma } from "../app/lib/prisma";
import { computeLayout, statusMeta } from "./seed/helpers";
import { businessDomains } from "./seed/data/business-domains";
import { categories } from "./seed/data/categories";
import { projects } from "./seed/data/projects";
import { resources } from "./seed/data/resources";
import { roadmaps } from "./seed/data/roadmaps";
import { topics } from "./seed/data/topics";

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        order: category.order ?? 0,
      },
      update: {
        name: category.name,
        description: category.description,
        order: category.order ?? 0,
      },
    });
  }
  console.log(`[seed] categories: ${categories.length}`);
}

async function seedResources() {
  for (const resource of resources) {
    const core = {
      title: resource.title,
      summary: resource.summary,
      kind: resource.kind,
      status: resource.status,
      ...statusMeta(resource.status),
    };
    const row = await prisma.resource.upsert({
      where: { url: resource.url },
      create: { url: resource.url, ...core },
      update: core,
    });
    await prisma.resourceCategory.deleteMany({
      where: { resourceId: row.id },
    });
    await prisma.resource.update({
      where: { id: row.id },
      data: {
        categories: {
          create: resource.categories.map((slug) => ({
            category: { connect: { slug } },
          })),
        },
      },
    });
  }
  console.log(`[seed] resources: ${resources.length}`);
}

async function seedTopics() {
  for (const topic of topics) {
    const core = {
      title: topic.title,
      summary: topic.summary,
      difficulty: topic.difficulty,
      estimatedMinutes: topic.estimatedMinutes,
      status: topic.status,
      seoTitle: topic.seoTitle,
      seoDescription: topic.seoDescription,
      seoImage: topic.seoImage,
      ...statusMeta(topic.status),
    };
    const row = await prisma.topic.upsert({
      where: { slug: topic.slug },
      create: { slug: topic.slug, ...core },
      update: core,
    });

    await prisma.topicContentBlock.deleteMany({ where: { topicId: row.id } });
    await prisma.topicResource.deleteMany({ where: { topicId: row.id } });
    await prisma.topicCategory.deleteMany({ where: { topicId: row.id } });

    await prisma.topic.update({
      where: { id: row.id },
      data: {
        blocks: {
          create: topic.blocks.map((block, index) => ({
            type: block.type,
            order: index,
            title: block.title,
            body: block.body,
            language: block.language,
            data: block.data ?? undefined,
          })),
        },
        resources: {
          create: topic.resources.map((link, index) => ({
            order: index,
            note: link.note,
            resource: { connect: { url: link.url } },
          })),
        },
        categories: {
          create: topic.categories.map((slug) => ({
            category: { connect: { slug } },
          })),
        },
      },
    });
  }

  // Second pass: cross-topic links now that every topic row exists.
  for (const topic of topics) {
    const related = [...new Set(topic.related)].filter(
      (slug) => slug !== topic.slug,
    );
    await prisma.topic.update({
      where: { slug: topic.slug },
      data: {
        relatedTopics: { set: related.map((slug) => ({ slug })) },
      },
    });
  }
  console.log(`[seed] topics: ${topics.length}`);
}

async function seedDomains() {
  for (const domain of businessDomains) {
    const core = {
      title: domain.title,
      summary: domain.summary,
      definition: domain.definition,
      developerRelevance: domain.developerRelevance,
      status: domain.status,
      seoTitle: domain.seoTitle,
      seoDescription: domain.seoDescription,
      seoImage: domain.seoImage,
      ...statusMeta(domain.status),
    };
    const row = await prisma.businessDomain.upsert({
      where: { slug: domain.slug },
      create: { slug: domain.slug, ...core },
      update: core,
    });

    await prisma.businessDomainPoint.deleteMany({
      where: { domainId: row.id },
    });
    await prisma.businessDomainCategory.deleteMany({
      where: { domainId: row.id },
    });

    await prisma.businessDomain.update({
      where: { id: row.id },
      data: {
        points: {
          create: domain.points.map((point, index) => ({
            kind: point.kind,
            title: point.title,
            body: point.body,
            order: index,
          })),
        },
        categories: {
          create: domain.categories.map((slug) => ({
            category: { connect: { slug } },
          })),
        },
        topics: { set: domain.topics.map((slug) => ({ slug })) },
        resources: { set: domain.resources.map((url) => ({ url })) },
      },
    });
  }
  console.log(`[seed] business domains: ${businessDomains.length}`);
}

async function seedProjects() {
  for (const project of projects) {
    const core = {
      title: project.title,
      summary: project.summary,
      scenario: project.scenario,
      difficulty: project.difficulty,
      estimatedHours: project.estimatedHours,
      learningGoals: project.learningGoals,
      requirements: project.requirements,
      features: project.features,
      architectureNotes: project.architectureNotes,
      databaseNotes: project.databaseNotes,
      apiNotes: project.apiNotes,
      testingNotes: project.testingNotes,
      status: project.status,
      seoTitle: project.seoTitle,
      seoDescription: project.seoDescription,
      seoImage: project.seoImage,
      ...statusMeta(project.status),
    };
    const row = await prisma.project.upsert({
      where: { slug: project.slug },
      create: { slug: project.slug, ...core },
      update: core,
    });

    await prisma.projectMilestone.deleteMany({ where: { projectId: row.id } });
    await prisma.projectResource.deleteMany({ where: { projectId: row.id } });
    await prisma.projectCategory.deleteMany({ where: { projectId: row.id } });

    await prisma.project.update({
      where: { id: row.id },
      data: {
        milestones: {
          create: project.milestones.map((milestone, index) => ({
            title: milestone.title,
            body: milestone.body,
            order: index,
          })),
        },
        resources: {
          create: project.resources.map((link, index) => ({
            order: index,
            note: link.note,
            resource: { connect: { url: link.url } },
          })),
        },
        categories: {
          create: project.categories.map((slug) => ({
            category: { connect: { slug } },
          })),
        },
        topics: { set: project.topics.map((slug) => ({ slug })) },
        domains: { set: project.domains.map((slug) => ({ slug })) },
      },
    });
  }
  console.log(`[seed] projects: ${projects.length}`);
}

/** Wires domain → project links after both sides exist. */
async function seedDomainProjectLinks() {
  for (const domain of businessDomains) {
    if (domain.projects.length === 0) continue;
    await prisma.businessDomain.update({
      where: { slug: domain.slug },
      data: { projects: { set: domain.projects.map((slug) => ({ slug })) } },
    });
  }
}

async function seedRoadmaps() {
  for (const roadmap of roadmaps) {
    const layout = computeLayout(roadmap.nodes, roadmap.edges);
    const core = {
      title: roadmap.title,
      summary: roadmap.summary,
      description: roadmap.description,
      audience: roadmap.audience,
      prerequisiteNotes: roadmap.prerequisiteNotes,
      difficulty: roadmap.difficulty,
      estimatedHours: roadmap.estimatedHours,
      icon: roadmap.icon,
      featured: roadmap.featured ?? false,
      order: roadmap.order ?? 0,
      status: roadmap.status,
      seoTitle: roadmap.seoTitle,
      seoDescription: roadmap.seoDescription,
      seoImage: roadmap.seoImage,
      ...statusMeta(roadmap.status),
    };
    const row = await prisma.roadmap.upsert({
      where: { slug: roadmap.slug },
      create: { slug: roadmap.slug, ...core },
      update: core,
    });

    await prisma.roadmapEdge.deleteMany({ where: { roadmapId: row.id } });
    await prisma.roadmapNode.deleteMany({ where: { roadmapId: row.id } });
    await prisma.roadmapSection.deleteMany({ where: { roadmapId: row.id } });
    await prisma.roadmapCategory.deleteMany({ where: { roadmapId: row.id } });

    const sectionIdByKey = new Map<string, string>();
    for (const [index, section] of roadmap.sections.entries()) {
      const created = await prisma.roadmapSection.create({
        data: {
          roadmapId: row.id,
          title: section.title,
          color: section.color,
          order: index,
        },
      });
      sectionIdByKey.set(section.key, created.id);
    }

    const topicSlugs = [
      ...new Set(
        roadmap.nodes
          .map((node) => node.topic)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    ];
    const topicRows = await prisma.topic.findMany({
      where: { slug: { in: topicSlugs } },
      select: { id: true, slug: true },
    });
    const topicIdBySlug = new Map(topicRows.map((t) => [t.slug, t.id]));

    const relatedSlugs = roadmap.relatedTopics
      ? roadmap.relatedTopics
      : (
          await prisma.topic.findMany({
            where: {
              status: "PUBLISHED",
              slug: { notIn: topicSlugs },
              relatedFrom: { some: { slug: { in: topicSlugs } } },
            },
            select: { slug: true },
            orderBy: { title: "asc" },
            take: 6,
          })
        ).map((topic) => topic.slug);

    const nodeIdByKey = new Map<string, string>();
    for (const [index, node] of roadmap.nodes.entries()) {
      const position = layout.get(node.key) ?? { x: 80, y: 60 };
      const sectionId = node.section ? sectionIdByKey.get(node.section) : null;
      if (node.section && !sectionId) {
        throw new Error(
          `Roadmap ${roadmap.slug}: node "${node.key}" references unknown section "${node.section}"`,
        );
      }
      let topicId: string | null = null;
      if (node.topic) {
        const found = topicIdBySlug.get(node.topic);
        if (!found) {
          throw new Error(
            `Roadmap ${roadmap.slug}: node "${node.key}" references unknown topic "${node.topic}"`,
          );
        }
        topicId = found;
      }
      const created = await prisma.roadmapNode.create({
        data: {
          roadmapId: row.id,
          sectionId,
          topicId,
          title: node.title,
          summary: node.summary,
          x: position.x,
          y: position.y,
          difficulty: node.difficulty,
          estimatedMinutes: node.estimatedMinutes,
          required: node.required ?? true,
          order: index,
        },
      });
      nodeIdByKey.set(node.key, created.id);
    }

    for (const [index, edge] of roadmap.edges.entries()) {
      const sourceId = nodeIdByKey.get(edge.from);
      const targetId = nodeIdByKey.get(edge.to);
      if (!sourceId || !targetId) {
        throw new Error(
          `Roadmap ${roadmap.slug}: edge "${edge.from}" -> "${edge.to}" references an unknown node key`,
        );
      }
      await prisma.roadmapEdge.create({
        data: {
          roadmapId: row.id,
          sourceId,
          targetId,
          relationship: edge.relationship,
          order: index,
        },
      });
    }

    await prisma.roadmap.update({
      where: { id: row.id },
      data: {
        categories: {
          create: roadmap.categories.map((slug) => ({
            category: { connect: { slug } },
          })),
        },
        relatedTopics: {
          set: relatedSlugs.map((slug) => ({ slug })),
        },
      },
    });
  }
  console.log(`[seed] roadmaps: ${roadmaps.length}`);
}

/** Controlled admin bootstrap — no public registration exists in V1. */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log(
      "[seed] ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin bootstrap",
    );
    return;
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      id: randomUUID(),
      name: process.env.ADMIN_NAME?.trim() || "Admin",
      email,
      emailVerified: true,
      role: "ADMIN",
    },
    update: { role: "ADMIN", emailVerified: true },
  });
  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { accountId: user.id, password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        providerId: "credential",
        accountId: user.id,
        userId: user.id,
        password: passwordHash,
      },
    });
  }
  console.log(`[seed] admin user: ${email}`);
}

async function reportCounts() {
  const [roadmaps, topics, domains, projects, resources, edges, nodes] =
    await Promise.all([
      prisma.roadmap.count(),
      prisma.topic.count(),
      prisma.businessDomain.count(),
      prisma.project.count(),
      prisma.resource.count(),
      prisma.roadmapEdge.count(),
      prisma.roadmapNode.count(),
    ]);
  console.log(
    `[seed] totals — roadmaps: ${roadmaps}, nodes: ${nodes}, edges: ${edges}, topics: ${topics}, domains: ${domains}, projects: ${projects}, resources: ${resources}`,
  );
}

async function main() {
  const startedAt = Date.now();
  await seedCategories();
  await seedResources();
  await seedTopics();
  await seedDomains();
  await seedProjects();
  await seedDomainProjectLinks();
  await seedRoadmaps();
  await seedAdmin();
  await reportCounts();
  console.log(
    `[seed] done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
