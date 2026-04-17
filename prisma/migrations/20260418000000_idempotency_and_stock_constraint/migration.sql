-- AddColumn: stockDeducted and emailSent flags on Order for idempotency (C1, H12, H13)
ALTER TABLE "Order" ADD COLUMN "stockDeducted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "emailSent" BOOLEAN NOT NULL DEFAULT false;

-- H9: Prevent stock from going below zero at the DB level
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stock_non_negative" CHECK (stock >= 0);
