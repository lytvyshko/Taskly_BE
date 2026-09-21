ALTER TABLE tasks
ALTER COLUMN due_date TYPE VARCHAR(10)
USING due_date::date::text;

ALTER TABLE tasks
ADD CONSTRAINT tasks_due_date_format_check
CHECK (
  due_date IS NULL
  OR due_date ~ '^\d{4}-\d{2}-\d{2}$'
);
