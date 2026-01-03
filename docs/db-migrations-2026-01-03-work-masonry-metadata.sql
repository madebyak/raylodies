-- Raylodies: Work masonry metadata
-- Date: 2026-01-03
--
-- Purpose:
-- - Preserve original aspect ratios (9:16, 16:9, 3:4...) in Work grids without cropping
-- - Avoid layout shift (CLS) by storing intrinsic dimensions for thumbnails/media
-- - Support video projects by storing a poster image URL (used as project thumbnail in grids)

-- 1) Store project thumbnail intrinsic dimensions (for stable Work/home grids)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS thumbnail_width INTEGER,
  ADD COLUMN IF NOT EXISTS thumbnail_height INTEGER;

-- 2) Store media intrinsic dimensions and optional video poster URL
ALTER TABLE project_media
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS poster_url TEXT;

-- Optional: index for filtering/sorting by project_id + display_order (helps reorder + fetch)
CREATE INDEX IF NOT EXISTS idx_project_media_project_order
  ON project_media (project_id, display_order);


