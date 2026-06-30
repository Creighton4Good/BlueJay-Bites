# BlueJay-Bites

## Overview 
Our app will help students find free food on campus while reducing food waste and addressing food insecurity. When events have extra food, organizers can post it in the app, and students receive real-time notifications with location and timing details. It’s a simple, scalable solution that makes better use of resources already on campus while ensuring surplus food reaches those who can use it.

---

## Features:
* Organizers can manage events, including key info (title, servings, building, images, etc)
* Event page shows lists of events with info for the user to evaluate
* Notifications notify user when an event becomes available
* Map directions help user navigate to their destination
* Admins can manage the events and roles

---

## Tech Stack:
* Spring Boot 3.5.7 (Java 21)
* MySQL 9.x for persistence
* Spring Data JPA / Hibernate for ORM
* Spring Security for role-based authorization
* Maven for dependency management

---

## Running the app locally:
Follow the steps below to run the app either on Expo Go or on the web.

### Prerequisites
* Expo Go app (iOS or Android)
* npm or yarn
* Node.js
* Maven
* MySQL Server
* Java JDK 17+

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

Find your IP address from terminal:
* Mac: `ipconfig getifaddr en0`
* Windows: `ipconfig` -> look for IPv4 address
* Linux: `hostname -I`

Then implement it:
```
BASE_URL=http://YOUR_IP_ADDRESS:8080
```

**3. Run the frontend (for mobile or web)**

```
npx expo start
``` 
or 
```
npm start
```

**4. Accessing the app**
* Open localhost:8081 on browser for web
* Scan the QR code for mobile Expo Go

---

## For a quick look at the app's structure:
Take a look [here](https://jhb09808.github.io/)

---

## License:
This project is licensed uner the MIT license - take a look at the license file for details
