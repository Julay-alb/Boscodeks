-- Seed data for helpdesk SQLite DB

-- Insert admin user (password will be hashed by init_db.py)
INSERT INTO users (username, full_name, password_hash, role)
VALUES
('admin', 'Julian Albarracin', 'changeme', 'admin'),
('agent1', 'Agente Uno', 'changeme', 'agent');

-- Example tickets
INSERT INTO tickets (title, description, priority, status, reporter_id, assignee_id)
VALUES ('Problema con login', 'El usuario no puede iniciar sesión en la app', 'high', 'open', 1, 2);

INSERT INTO tickets (title, description, priority, status, reporter_id)
VALUES ('Solicitud de acceso', 'Necesito acceso al dashboard de ventas', 'low', 'open', 2);

-- Example comment
INSERT INTO comments (ticket_id, author_id, text)
VALUES (1, 2, 'Revisando el problema, pidan logs por favor.');
