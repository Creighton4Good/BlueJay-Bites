-- Roles
INSERT IGNORE INTO roles (id, role_name, description) VALUES
(1, 'user', 'Regular user who can view food events'),
(2, 'event_organizer', 'Can create and manage their own food events'),
(3, 'admin', 'Full platform oversight and management');

-- Test Users
INSERT IGNORE INTO users (id, auth_provider, created_at, display_name, email, password_hash, role_id) VALUES
(1, 'local', NOW(), 'Test Organizer', 'testorganizer@example.com', 'placeholder', 2),
(2, 'local', NOW(), 'Test User', 'testuser@example.com', 'placeholder', 1);

-- User Preferences
INSERT IGNORE INTO user_preferences(user_id, notification_preference, updated_at) VALUES
(2, 'on', NOW());

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

-- Sample Food Events
-- Times are relative to startup so seeded events are always currently active.
INSERT IGNORE INTO posts
  (id, title, description, notes, building_id, directions, room_number,
   food_type_id, servings_min, servings_max, available_from, available_until,
   status, created_by, created_at, updated_at)
VALUES
(101, 'Leftover Pizza from Business Club',
 'About ten boxes of cheese and pepperoni pizza left over from our evening meeting. Plates and napkins provided.',
 'Please take only what you will eat.',
 1, 'Second floor, past the main staircase.', '227',
 1, 20, 40,
 NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 4 HOUR,
 'active', 1, NOW(), NOW()),

(102, 'Sandwich Trays After Career Fair',
 'Assorted turkey, ham, and vegetarian sandwich trays remaining from the afternoon career fair.',
 NULL,
 2, 'Main level ballroom, near the north entrance.', 'Ballroom',
 2, 15, 30,
 NOW() - INTERVAL 30 MINUTE, NOW() + INTERVAL 3 HOUR,
 'active', 1, NOW(), NOW()),

(103, 'Breakfast Pastries from Faculty Meeting',
 'Muffins, croissants, and fruit left from the morning faculty meeting. Coffee still available.',
 'Vegetarian options available.',
 5, 'First floor lounge, across from the elevators.', '110',
 3, 10, 20,
 NOW() - INTERVAL 2 HOUR, NOW() + INTERVAL 2 HOUR,
 'active', 1, NOW(), NOW()),

(104, 'Dessert Table from Alumni Reception',
 'Cookies, brownies, and cheesecake bites from the alumni reception.',
 NULL,
 8, 'Enter through the main doors, event space is on the right.', 'Hall A',
 6, 25, 50,
 NOW(), NOW() + INTERVAL 5 HOUR,
 'active', 1, NOW(), NOW());

-- Dietary tags for the sample events
INSERT IGNORE INTO post_dietary_options (post_id, dietary_option_id) VALUES
(101, 1),
(102, 1),
(102, 3),
(103, 1),
(103, 5),
(104, 1);

-- Dietary tags for the sample events
INSERT IGNORE INTO post_dietary_options (post_id, dietary_option_id) VALUES
(101, 1),
(102, 1),
(102, 3),
(103, 1),
(103, 5),
(104, 1);
