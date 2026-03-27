-- CreateIndex
CREATE INDEX "Candidat_partiId_idx" ON "Candidat"("partiId");

-- CreateIndex
CREATE INDEX "Sondage_candidatId_idx" ON "Sondage"("candidatId");

-- CreateIndex
CREATE INDEX "Sondage_date_idx" ON "Sondage"("date");

-- CreateIndex
CREATE INDEX "Actualite_candidatId_idx" ON "Actualite"("candidatId");

-- CreateIndex
CREATE INDEX "Actualite_publishedAt_idx" ON "Actualite"("publishedAt");

-- CreateIndex
CREATE INDEX "Evenement_dateDebut_idx" ON "Evenement"("dateDebut");
