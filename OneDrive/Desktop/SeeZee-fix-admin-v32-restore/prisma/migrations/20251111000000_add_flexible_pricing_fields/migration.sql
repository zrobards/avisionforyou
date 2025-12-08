-- AlterTable (with existence check)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='isFirstInvoice') THEN
    ALTER TABLE "invoices" ADD COLUMN "isFirstInvoice" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- AlterTable (with existence checks)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='planName') THEN
    ALTER TABLE "subscriptions" ADD COLUMN "planName" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='changeRequestsAllowed') THEN
    ALTER TABLE "subscriptions" ADD COLUMN "changeRequestsAllowed" INTEGER NOT NULL DEFAULT 2;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='changeRequestsUsed') THEN
    ALTER TABLE "subscriptions" ADD COLUMN "changeRequestsUsed" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='resetDate') THEN
    ALTER TABLE "subscriptions" ADD COLUMN "resetDate" TIMESTAMP(3);
  END IF;
END $$;

-- CreateTable (with existence check)
CREATE TABLE IF NOT EXISTS "change_requests" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "change_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (with existence check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'change_requests_projectId_fkey'
  ) THEN
    ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey (with existence check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'change_requests_subscriptionId_fkey'
  ) THEN
    ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;



