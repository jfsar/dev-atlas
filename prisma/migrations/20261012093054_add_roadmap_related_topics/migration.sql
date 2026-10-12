-- CreateTable
CREATE TABLE "_RoadmapRelatedTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoadmapRelatedTopics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RoadmapRelatedTopics_B_index" ON "_RoadmapRelatedTopics"("B");

-- AddForeignKey
ALTER TABLE "_RoadmapRelatedTopics" ADD CONSTRAINT "_RoadmapRelatedTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoadmapRelatedTopics" ADD CONSTRAINT "_RoadmapRelatedTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
