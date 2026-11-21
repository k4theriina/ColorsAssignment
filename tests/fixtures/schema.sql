-- Test database for integration tests (CI only). Mirrors the COLORS schema.
CREATE TABLE IF NOT EXISTS Users (
  ID INT NOT NULL AUTO_INCREMENT,
  DateCreated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  DateLastLoggedIn DATETIME NULL DEFAULT NULL,
  FirstName VARCHAR(50) NOT NULL DEFAULT '',
  LastName VARCHAR(50) NOT NULL DEFAULT '',
  Login VARCHAR(50) NOT NULL DEFAULT '',
  Password VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS Colors (
  ID INT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(50) NOT NULL DEFAULT '',
  UserID INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

INSERT INTO Users (FirstName, LastName, Login, Password)
VALUES ('Test', 'User', 'testuser', 'testpass');

INSERT INTO Colors (Name, UserID) VALUES
  ('Blue', 1), ('Sky Blue', 1), ('Red', 1);
