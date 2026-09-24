# COLORS — LAMP Stack Application

COLORS is a small web app where a user logs in, then searches and adds color names stored in a database. It is built with the **LAMP** stack:

- **L**inux — operating system
- **A**pache — web server that serves HTML/CSS/JS and runs PHP
- **M**ySQL — database that stores users and colors
- **P**HP — backend API that talks to MySQL

You do **not** need prior lab experience to understand or run this project. Everything required is described below.

## What the application does

1. Open the **login page** (`index.html`).
2. Enter a username and password that already exist in the MySQL `Users` table.
3. On success, the browser saves a short-lived cookie and opens the **colors page** (`color.html`).
4. On that page you can:
   - **Search** for colors belonging to your user (partial name match)
   - **Add** a new color name for your user
   - **Log out** (clears the cookie and returns to login)

There is no sign-up / registration screen. Accounts must already exist in the database.

## How the pieces fit together

```
Browser (public/)  --JSON POST-->  PHP API (api/, served as /LAMPAPI)  --SQL-->  MySQL
```

- `public/` holds the HTML, CSS, and JavaScript the user sees.
- `api/` holds PHP scripts that accept JSON, query MySQL, and return JSON.
- The frontend is configured to call the API under the URL path **`/LAMPAPI`** (for example `/LAMPAPI/Login.php`). When you deploy, the contents of `api/` must be reachable at that path.

## Technologies

| Layer | Technology |
|--------|------------|
| Web server | Apache (or another server that can host PHP) |
| Backend | PHP |
| Database | MySQL |
| Frontend | HTML, CSS, JavaScript (`XMLHttpRequest` + JSON) |

## Repository structure

```
colors-lamp/
├── api/                   # PHP API (deploy as /LAMPAPI on the server)
│   ├── Login.php          # Authenticate a user
│   ├── AddColor.php       # Insert a color for a user
│   ├── SearchColors.php   # Search a user's colors
│   ├── config.example.php # Safe template for DB settings
│   └── config.php         # Your real DB settings (gitignored — do not commit)
├── public/                # Files the browser loads
│   ├── index.html         # Login
│   ├── color.html         # Search / add colors
│   ├── css/
│   ├── js/
│   └── images/
├── README.md
└── .gitignore
```

## Prerequisites

Before running the app you need:

1. A computer or virtual machine with **Apache**, **PHP** (with MySQLi), and **MySQL** installed and running.
2. A MySQL database and user account that PHP can connect to.
3. Tables and at least one test user (see next section).

## Database setup

Create a database (any name is fine; many course VMs use `COP4331`). The PHP code expects roughly these tables and columns:

**`Users`**

| Column | Purpose |
|--------|---------|
| `ID` | Numeric user id |
| `firstName` | First name returned after login |
| `lastName` | Last name returned after login |
| `Login` | Username typed on the login form |
| `Password` | Password typed on the login form |

**`Colors`**

| Column | Purpose |
|--------|---------|
| `UserId` / `UserID` | Owner of the color (matches `Users.ID`) |
| `Name` | Color name string (e.g. `Blue`) |

Example (adjust types/names if your environment differs):

```sql
CREATE DATABASE IF NOT EXISTS COP4331;
USE COP4331;

CREATE TABLE Users (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  Login VARCHAR(50),
  Password VARCHAR(50)
);

CREATE TABLE Colors (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(50),
  UserID INT
);

INSERT INTO Users (firstName, lastName, Login, Password)
VALUES ('Test', 'User', 'test', 'test123');
```

You will log in with whatever `Login` / `Password` rows you insert.

## Setup (from zero)

1. **Clone this repository**
   ```bash
   git clone https://github.com/k4theriina/ColorsAssignment.git
   cd ColorsAssignment
   ```

2. **Create your local database config**  
   Real passwords stay out of Git. Copy the example file and edit it:
   ```bash
   cp api/config.example.php api/config.php
   ```
   In `api/config.php`, set:
   - `$DB_HOST` — usually `localhost`
   - `$DB_USER` — your MySQL username
   - `$DB_PASS` — your MySQL password
   - `$DB_NAME` — your database name  

   Never commit `api/config.php` (it is listed in `.gitignore`).

3. **Create the database tables and a test user** (see [Database setup](#database-setup) above).

4. **Deploy files so Apache can serve them**
   - Put the contents of `public/` where the web server can serve them as your site (often the Apache document root, or a subdirectory).
   - Put the contents of `api/` where they are reachable as **`/LAMPAPI`**. For example:
     - copy/symlink `api/` → `/var/www/html/LAMPAPI`, **or**
     - add an Apache `Alias /LAMPAPI /path/to/this/repo/api`

5. Confirm PHP can connect to MySQL with the credentials in `config.php`.

## How to run and access

1. Start **Apache** and **MySQL** if they are not already running.
2. In a browser, open the login page. Examples:
   - `http://localhost/index.html`
   - `http://YOUR_SERVER_IP/index.html`  
   The exact URL depends on where you placed `public/`.
3. Log in with a username/password that exists in the `Users` table.
4. After a successful login you are taken to `color.html`. Search or add colors there.
5. Use **Log Out** to clear the session cookie and return to the login page.

### API reference

All endpoints expect **HTTP POST** with a **JSON** body and return JSON.

| URL | Body fields | Purpose |
|-----|-------------|---------|
| `/LAMPAPI/Login.php` | `login`, `password` | Look up user; returns `id`, `firstName`, `lastName` |
| `/LAMPAPI/SearchColors.php` | `search`, `userId` | Return matching color names for that user |
| `/LAMPAPI/AddColor.php` | `color`, `userId` | Insert a new color for that user |

## Assumptions and limitations

- This app does **not** create accounts; you must seed users in MySQL yourself.
- Database credentials are never stored in the public repository.
- The frontend hard-codes the API base path `/LAMPAPI` in `public/js/code.js`. If your API lives elsewhere, change that path or alias the server to match.
- Login currently sends the password as typed. An MD5 helper exists in the frontend but is not required for the default flow.
- This is a teaching/demo project: limited validation, cookie-based client state, and not hardened for production use.

## AI Assistance Disclosure

This project was developed with assistance from generative AI tools:

- **Tool**: Cursor (Composer agent)
- **Dates**: September 24, 2026
- **Scope**: Organizing the existing COLORS LAMP project into a clean repository layout, removing credentials from tracked files, and drafting this README
- **Use**: Repository structure guidance and README drafting (edited for accuracy). Application logic and structure come from the original LAMP stack implementation and were not generated by AI for this submission

All AI-generated documentation was reviewed and edited to match the actual project. Final repository contents reflect the lab implementation and my understanding of the work.

## License

See the license file in this repository for terms of use.
