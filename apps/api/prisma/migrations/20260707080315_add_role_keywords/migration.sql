-- CreateTable
CREATE TABLE "role_keywords" (
    "id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "aliases" JSONB NOT NULL DEFAULT '[]',
    "weight" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_keywords_role_idx" ON "role_keywords"("role");

-- CreateIndex
CREATE INDEX "role_keywords_role_category_idx" ON "role_keywords"("role", "category");
