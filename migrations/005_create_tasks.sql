CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL
    CHECK (length(trim(title)) > 0),
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  due_date DATE,
  tag VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_user_id_due_date_idx ON tasks(user_id, due_date);
