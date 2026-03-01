-- CreateTable
CREATE TABLE "calendars" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "genres" TEXT[],
    "hours_per_week" INTEGER NOT NULL,
    "time_period" TEXT NOT NULL,
    "play_style" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_games" (
    "id" TEXT NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "igdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "cover_url" TEXT,
    "estimated_hours" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_games_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "calendar_games" ADD CONSTRAINT "calendar_games_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
