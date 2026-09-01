# BlueJay-Bites

### Providing food, saving valuable resources, and benefitting the environment & community.

## Overview 
Our app helps students find free food on the Creighton University campus while reducing food waste and addressing food insecurity. When events have extra food, organizers can post it in the app, and students receive real-time notifications with location and timing details. It’s a simple, scalable solution that makes better use of resources already on campus while ensuring surplus food reaches those who can use it.

---

## Features:
* Organizers can create/manage events, which includes key event info (title, food type/dietary restrictions, servings, building, images, etc)
* Event page shows lists of events with info for the user to evaluate
* Notifications notify user when an event becomes available
* Map helps user navigate to their destination
* Admins can manage the events and roles, and monitor the app

---

## For a quick demo of the app's structure:
Take a look [here](https://creighton4good.github.io/BlueJay-Bites/prototype.html)

---

## Tech Stack:

**Frontend**
* React Native with Expo, targeting iOS, Android, and web
* TypeScript
* Expo Router for navigation

**Backend**
* Spring Boot 3.5.7 (Java 21)
* MySQL 9.x for persistence
* Spring Data JPA / Hibernate for ORM
* Spring Security for role-based authorization
* Maven for dependency management

**Authentication**
* Microsoft Entra ID single sign-on, so users log in with their Creighton accounts

**Infrastructure**
* AWS ECS Fargate for the backend, RDS for the database, S3 for photos, and an application load balancer

---

## Running the app locally:
Follow the steps below to run the app either on Expo Go or on the web.

### Prerequisites
* Expo Go app (iOS or Android)
* npm or yarn
* Node.js
* Maven
* MySQL Server
* Java JDK 21

---

## Step 1: Setup
Clone the repository:
```
git clone https://github.com/Creighton4Good/bluejay-bites.git
cd bluejay-bites
```

---

## Step 2: Start the backend

In a terminal (i.e. windows powershell or command prompt), run:

```
cd backend
```
Then:

```
mvn spring-boot:run
```
After running, can view backend endpoints at `localhost:8080`

---

## Step 3: Start the frontend
**1. Open a second terminal**

**2. Install Frontend Dependencies**
   
```
npm install
```
### For mobile version of application:
* Ensure phone is on same wifi as computer

The app works out the backend address automatically. On a physical device it uses the LAN address of the Expo dev server, and on simulators it falls back to the usual loopback addresses, so you normally do not need to configure anything.

If you do need to point the app at a specific backend, find your IP address from a terminal:
* Mac: `ipconfig getifaddr en0`
* Windows: `ipconfig` -> look for IPv4 address
* Linux: `hostname -I`

Then set EXPO_PUBLIC_API_URL in a .env file:
```
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:8080
```

Note that this only applies to native. On web the app always uses http://localhost:8080 and ignores this variable. Remember to remove a stale value if you set one, since pointing at the wrong host causes confusing authentication errors.

**3. Run the frontend (for mobile or web)**

```
npx expo start
``` 
or 
```
npm start
```

**4. Accessing the app**
* Open `localhost:8081` on browser for web
* Scan the QR code to access Expo Go on mobile

---

## Creighton4Good BlueJay Bites Development Team (past and present)
_Erika Germinario_
* A Creighton University alum, class of 2026, with a double major in Psychology and Computer Science. On BlueJay Bites, she worked across frontend development, authentication, and user roles, with a focus on making the app practical and easy to use.

_Jerome Bustarga_
* A Creighton University alum, class of 2026. He loves building web applications, and working on something that creates real impact is close to his heart. On BlueJay Bites he focused on backend development and building out the app's cloud infrastructure.

_Torin O'Connor_
* A Creighton University student of the class of 2028, with a major in Data Science. In his free time, he enjoys playing sports, his trombone, and traveling the world. He saw the opportunity this project provided to help the environment and local communities and was excited to make a positive impact.

## Contributions

For details on contributing to the application, take a look [here](https://github.com/Creighton4Good/BlueJay-Bites?tab=contributing-ov-file)

## Questions?

Feel free to email creighton4good@gmail.com

## License:
This project is licensed uner the MIT license - take a look at the [license](https://github.com/Creighton4Good/BlueJay-Bites?tab=License-1-ov-file) for details
