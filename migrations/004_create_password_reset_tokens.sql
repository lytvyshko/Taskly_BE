CREATE TABLE password_reset_tokens (
   id SERIAL PRIMARY KEY,
   user_id INTEGER NOT NULL
     REFERENCES users(id)
       ON DELETE CASCADE,
   selector UUID NOT NULL UNIQUE,
   token_hash TEXT NOT NULL,
   expires_at TIMESTAMPTZ NOT NULL,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
