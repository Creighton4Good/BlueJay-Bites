-- Roles
INSERT IGNORE INTO roles (id, role_name, description) VALUES
(1, 'user', 'Regular user who can view food events'),
(2, 'event_organizer', 'Can create and manage their own food events'),
(3, 'admin', 'Full platform oversight and management');

-- Test Users
INSERT IGNORE INTO users (id, auth_provider, created_at, display_name, email, password_hash, role_id) VALUES
(1, 'local', NOW(), 'Test User', 'testuser@example.com', 'placeholder', 1),
(2, 'local', NOW(), 'Test Organizer', 'testorganizer@example.com', 'placeholder', 2);

-- Buildings (Creighton campus)
INSERT IGNORE INTO buildings (id, building_name, latitude, longitude) VALUES
(1, 'Harper Center', 41.2653, -95.9434),
(2, 'Skutt Student Center', 41.2642, -95.9498),
(3, 'Hitchcock Communication Arts Building', 41.2652, -95.9500),
(4, 'Creighton Hall', 41.2653, -95.9478),
(5, 'Hixson-Lied Science Building', 41.2661, -95.9505),
(6, 'Reinert Alumni Library', 41.2654, -95.9492),
(7, 'Criss Complex', 41.2664, -95.9508),
(8, 'Werner Center', 41.2674, -95.9512),
(9, 'Eppley Building', 41.2659, -95.9498);

-- Food Types
INSERT IGNORE INTO food_types (id, type_name) VALUES
(1, 'Pizza'),
(2, 'Sandwiches'),
(3, 'Breakfast'),
(4, 'Lunch'),
(5, 'Dinner'),
(6, 'Dessert'),
(7, 'Snacks'),
(8, 'Beverages'),
(9, 'Salad'),
(10, 'Italian'),
(11, 'Mexican'),
(12, 'Asian'),
(13, 'American'),
(14, 'Chinese'),
(15, 'Japanese');

-- Dietary Options
INSERT IGNORE INTO dietary_options (id, option_name) VALUES
(1, 'Vegetarian'),
(2, 'Vegan'),
(3, 'Gluten-Free'),
(4, 'Dairy-Free'),
(5, 'Nut-Free'),
(6, 'Halal'),
(7, 'Kosher'),
(8, 'Organic'),
(9, 'Low-Carb');
