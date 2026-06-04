-- AlterTable
ALTER TABLE "route_cache" ADD COLUMN     "transportMode" "ContractorTransportation" NOT NULL DEFAULT 'CAR';

-- CreateIndex
CREATE INDEX "route_cache_fromLat_fromLng_toLat_toLng_transportMode_idx" ON "route_cache"("fromLat", "fromLng", "toLat", "toLng", "transportMode");
