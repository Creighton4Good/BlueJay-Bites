-- Roles
INSERT IGNORE INTO roles (id, role_name, description) VALUES
(1, 'user', 'Regular user who can view food events'),
(2, 'event_organizer', 'Can create and manage their own food events'),
(3, 'admin', 'Full platform oversight and management');

-- Buildings (Creighton campus)
INSERT IGNORE INTO buildings (id, building_name, latitude, longitude) VALUES
(1, 'Harper Center', 41.2627, -95.9491),
(2, 'Skutt Student Center', 41.2640, -95.9476),
(3, 'Hitchcock Communication Arts Building', 41.2618, -95.9482),
(4, 'Creighton Hall', 41.2615, -95.9498),
(5, 'Hixson-Lied Science Building', 41.2630, -95.9510),
(6, 'Reinert Alumni Library', 41.2622, -95.9495);

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
(13, 'American');

-- Dietary Options
INSERT IGNORE INTO dietary_options (id, option_name) VALUES
(1, 'Vegetarian'),
(2, 'Vegan'),
(3, 'Gluten-Free'),
(4, 'Dairy-Free'),
(5, 'Nut-Free'),
(6, 'Halal'),
(7, 'Kosher');
