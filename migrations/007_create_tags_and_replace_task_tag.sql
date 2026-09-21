CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL DEFAULT 'primary',
  icon VARCHAR(100) NOT NULL DEFAULT 'label',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, title)
);

INSERT INTO tags (user_id, title)
SELECT DISTINCT user_id, btrim(tag)
FROM tasks
WHERE tag IS NOT NULL
  AND btrim(tag) <> '';

ALTER TABLE tasks
ADD COLUMN tag_id INTEGER;

UPDATE tasks
SET tag_id = tags.id
FROM tags
WHERE tags.user_id = tasks.user_id
  AND tags.title = btrim(tasks.tag);

ALTER TABLE tasks
ADD CONSTRAINT tasks_tag_id_fkey
FOREIGN KEY (tag_id)
REFERENCES tags(id)
ON DELETE SET NULL;

CREATE INDEX tags_user_id_idx ON tags(user_id);
CREATE INDEX tasks_tag_id_idx ON tasks(tag_id);

ALTER TABLE tasks
DROP COLUMN tag;
