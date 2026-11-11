INSERT INTO production_categories (id, name, slug, description, "order") VALUES
  ('a0000000-0000-4000-8000-000000000001', 'End of Month Live Worship', 'end-of-month-live-worship', 'Monthly gatherings for worship, prayer, and ministry in the presence of God.', 1),
  ('a0000000-0000-4000-8000-000000000002', 'Doctrine and Balance', 'doctrine-and-balance', 'Scripture-grounded teaching to help believers grow in truth and spiritual maturity.', 2),
  ('a0000000-0000-4000-8000-000000000003', 'Weekend Declaration', 'weekend-declaration', 'Short declarations and encouragement rooted in the Word of God.', 3),
  ('a0000000-0000-4000-8000-000000000004', 'Interviews and Testimonies', 'interviews-and-testimonies', 'Conversations and testimonies that share stories of faith and God at work.', 4),
  ('a0000000-0000-4000-8000-000000000005', 'Cloven Tongues of Fire', 'cloven-tongues-of-fire', 'Messages and media from the Cloven Tongues of Fire series.', 5)
ON CONFLICT (slug) DO NOTHING;
