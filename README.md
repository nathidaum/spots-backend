# Spots - Backend

## Description

This repository contains the **backend code** for the **Spots Project**, a platform that allows users to book or rent out unused office space. The backend is built using **Node.js**, **Express**, and **MongoDB** and serves as the API for managing user accounts, spots, bookings, and authentication.

The **frontend repository** with the user interface implementation can be found [here](https://github.com/nathidaum/spots-frontend) (replace with the actual link to the frontend repo).

---

## Instructions to Run the Backend

### Clone the Repository

```bash
git clone https://github.com/your-username/spots-backend.git
cd spots-backend
```

### Install Dependencies 
```bash
npm install
```

### Set up Environment Variables

1. Create a `.env` file in the root directory.
2. Add the following variables:

```bash
PORT=<Port Number>
MONGO_URL=<MongoDB Connection String>
TOKEN_SECRET=<Your Token Secret>
ORIGIN=https://workspots.netlify.app
```
- PORT: The port on which the server will run. Example: 5005.
- MONGO_URL: Connection string for your MongoDB database. 
Example: mongodb+srv://username:password@cluster.mongodb.net/spots?retryWrites=true&w=majority.

You will need: A MongoDB account to set up a database.

### Run the application
To start the development server, run:
```bash
npm run dev
```
Once the server is running, open your browser and navigate to http://localhost:5173.

## API Endpoints (Bonus)

Below are some of the API endpoints implemented in this project:

### Users
| Method | Endpoint      | Description            |
|--------|---------------|------------------------|
| POST   | `/auth/signup`| Register a new user    |
| POST   | `/auth/login` | Log in an existing user|
| GET    | `/profile`   | Retrieve user information |

### Spots
| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| GET    | `/spots`     | Retrieve all spots                |
| GET    | `/spots/:id` | Retrieve details of a single spot |
| POST   | `/spots`     | Create a new spot                 |
| DELETE | `/spots/:id` | Delete a spot                     |
| GET    | `/spots/cities`| Retrieve all cities with offered spots   |

### Bookings
| Method | Endpoint      | Description           |
|--------|---------------|-----------------------|
| GET    | `/bookings`   | Retrieve all bookings |
| POST   | `/bookings`   | Create a new booking  |

### Favorites
| Method | Endpoint               | Description                     |
|--------|------------------------|---------------------------------|
| GET    | `/users/favorites`     | Retrieve user's favorite spots  |
| POST   | `/users/favorites/:id` | Add/remove a spot from favorites|

---

## Technologies Used

- **Node.js**: Backend runtime environment
- **Express**: Web framework for handling routes and middleware
- **MongoDB**: NoSQL database for storing data
- **Mongoose**: ODM for MongoDB
- **Cloudinary**: Image upload and storage
- **JWT**: Authentication with JSON Web Tokens

## Demo

You can see the live frontend application hosted [here](https://workspots.netlify.app/).
