CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  owner VARCHAR(120),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tasks (title, description, priority, status, owner, due_date)
VALUES
('Configure Dev Namespace', 'Create namespace, services and ingress for dev.', 'High', 'In Progress', 'DevOps Engineer', CURRENT_DATE + INTERVAL '2 day'),
('Prepare Production Approval', 'Validate prod environment approval flow in Azure DevOps.', 'Medium', 'Pending', 'Release Manager', CURRENT_DATE + INTERVAL '4 day')
ON CONFLICT DO NOTHING;
