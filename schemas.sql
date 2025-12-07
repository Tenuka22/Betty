PRAGMA foreign_keys=on;

DROP TABLE IF EXISTS URLS_Table;

CREATE TABLE IF NOT EXISTS URLS_Table (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  FullUrl TEXT NOT NULL,
  MinifiedId TEXT NOT NULL,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO URLS_Table (FullUrl, MinifiedId)
VALUES
  ('https://google.com', 'ggl'),
  ('https://github.com', 'gh'),
  ('https://example.com', 'ex');
