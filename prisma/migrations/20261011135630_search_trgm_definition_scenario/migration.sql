-- CreateIndex
CREATE INDEX "BusinessDomain_definition_trgm_idx" ON "BusinessDomain" USING GIN ("definition" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Project_scenario_trgm_idx" ON "Project" USING GIN ("scenario" gin_trgm_ops);
