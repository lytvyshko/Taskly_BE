CREATE INDEX tasks_user_id_cursor_idx
ON tasks (
  user_id,
  completed,
  due_date,
  created_at DESC,
  id DESC
);
