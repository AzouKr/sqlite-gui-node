-- Dumping data for table users
CREATE TABLE users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT,
              password TEXT,
              role TEXT,
              age INTEGER,
              phone TEXT,
              email TEXT,
              city TEXT,
              availability INTEGER DEFAULT 0 CHECK (availability IN (0, 1)),
              team TEXT DEFAULT 'none',
              active INTEGER DEFAULT 0 CHECK (active IN (0, 1))
          );
-- Dumping data for table sqlite_sequence
CREATE TABLE sqlite_sequence(name,seq);
-- Dumping data for table team
CREATE TABLE team (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            prod_line INTEGER,
            supervisor TEXT
          );
-- Dumping data for table machinealerts
CREATE TABLE machinealerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine TEXT,
            cause TEXT,
            degree TEXT,
            status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'process', 'done')),
            supervisor TEXT,
            employee TEXT DEFAULT 'none',
            date DATETIME DEFAULT CURRENT_TIMESTAMP
          );
-- Dumping data for table useralerts
CREATE TABLE useralerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            desc TEXT,
            user TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
          );
-- Dumping data for table query
CREATE TABLE query (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT,
              sqlstatement TEXT
          );
-- 0 | id | INTEGER | 0 | null | 1
-- 1 | name | TEXT | 0 | null | 0
-- 2 | password | TEXT | 0 | null | 0
-- 3 | role | TEXT | 0 | null | 0
-- 4 | age | INTEGER | 0 | null | 0
-- 5 | phone | TEXT | 0 | null | 0
-- 6 | email | TEXT | 0 | null | 0
-- 7 | city | TEXT | 0 | null | 0
-- 8 | availability | INTEGER | 0 | 0 | 0
-- 9 | team | TEXT | 0 | 'none' | 0
-- 10 | active | INTEGER | 0 | 0 | 0
-- 0 | id | INTEGER | 0 | null | 1
-- 1 | desc | TEXT | 0 | null | 0
-- 2 | user | TEXT | 0 | null | 0
-- 3 | date | DATETIME | 0 | CURRENT_TIMESTAMP | 0
-- 0 | id | INTEGER | 0 | null | 1
-- 1 | name | TEXT | 0 | null | 0
-- 2 | sqlstatement | TEXT | 0 | null | 0
-- 0 | id | INTEGER | 0 | null | 1
-- 1 | machine | TEXT | 0 | null | 0
-- 2 | cause | TEXT | 0 | null | 0
-- 3 | degree | TEXT | 0 | null | 0
-- 4 | status | TEXT | 0 | 'waiting' | 0
-- 5 | supervisor | TEXT | 0 | null | 0
-- 6 | employee | TEXT | 0 | 'none' | 0
-- 7 | date | DATETIME | 0 | CURRENT_TIMESTAMP | 0
-- 0 | name |  | 0 | null | 0
-- 1 | seq |  | 0 | null | 0
-- 0 | id | INTEGER | 0 | null | 1
-- 1 | name | TEXT | 0 | null | 0
-- 2 | prod_line | INTEGER | 0 | null | 0
-- 3 | supervisor | TEXT | 0 | null | 0
INSERT INTO users (id, name, password, role, age, phone, email, city, availability, team, active) VALUES ('2', 'ARAAR ZINEB', '$2b$10$kQg7vpiL0gn0qzkSIsPVqufmC3fYoBoF8iQLM0ziHPmxQ134BvpVi', 'supervisor', '25', '+213698282788', 'zeineb.ara@gmail.com', 'Montreal', '0', 'none', '0');
INSERT INTO users (id, name, password, role, age, phone, email, city, availability, team, active) VALUES ('3', 'KERIM Abdelmouiz', '$2b$10$rssladUTttQm404yQgPWQ.eOpOxfkvJLtz29HE0Rp2FSCH.ql7k2G', 'admin', '23', '+213774736674', 'abdelmouizkerim@gmail.com', 'Ouargla', '0', 'none', '0');
INSERT INTO users (id, name, password, role, age, phone, email, city, availability, team, active) VALUES ('4', 'HADJ BRAHIM Yasmine', '$2b$10$2Mae7EMXwylRWv.KYs75qua4LOPVnNv3yXz7l5McxG./IivZ0uhWS', 'supervisor', '20', '+213754967833', 'yasmine@gmail.com', 'Alger', '0', 'none', '0');
INSERT INTO users (id, name, password, role, age, phone, email, city, availability, team, active) VALUES ('5', 'KERIM Yahia', '$2b$10$vlLEAkHPm/IETbsFZvvKBerit3n.ePfWFJYeAgFq7dwJiPw0ugfXu', 'technicien', '28', '+491624770984', 'kerimyahia@gmail.com', 'El Bayadh', '0', 'none', '0');
INSERT INTO users (id, name, password, role, age, phone, email, city, availability, team, active) VALUES ('6', 'HADJ BRAHIM Nour El Houda', '$2b$10$3omdzdsr9SsktF3LxrTDhODdAC7zmSYZ9mfyi3WCzb8HZAs2YiSKu', 'technicien', '22', '+213541485040', 'hbnoureelhouda@gmail.com', 'Alger', '0', 'none', '0');
INSERT INTO team (id, name, prod_line, supervisor) VALUES ('1', 'Team 1', 'Line 1', 'zeineb.ara@gmail.com');
INSERT INTO team (id, name, prod_line, supervisor) VALUES ('2', 'Team 2', 'Line 2', 'yasmine@gmail.com');
INSERT INTO machinealerts (id, machine, cause, degree, status, supervisor, employee, date) VALUES ('1', 'HM11', 'None', 'Risque', 'waiting', 'yasmine@gmail.com', 'none', '2024-05-14 10:48:14');
INSERT INTO machinealerts (id, machine, cause, degree, status, supervisor, employee, date) VALUES ('2', 'HM1', 'None', 'Risque', 'waiting', 'zeineb.ara@gmail.com', 'none', '2024-05-14 10:48:14');
INSERT INTO machinealerts (id, machine, cause, degree, status, supervisor, employee, date) VALUES ('3', 'HM12', 'None', 'Risque', 'waiting', 'yasmine@gmail.com', 'none', '2024-05-14 10:48:14');
INSERT INTO machinealerts (id, machine, cause, degree, status, supervisor, employee, date) VALUES ('4', 'MT1', 'None', 'Risque', 'waiting', 'yasmine@gmail.com', 'none', '2024-05-14 10:48:14');
INSERT INTO sqlite_sequence (name, seq) VALUES ('team', '2');
INSERT INTO sqlite_sequence (name, seq) VALUES ('users', '16');
INSERT INTO sqlite_sequence (name, seq) VALUES ('machinealerts', '4');
INSERT INTO sqlite_sequence (name, seq) VALUES ('query', '3');
INSERT INTO sqlite_sequence (name, seq) VALUES ('useralerts', '1');
INSERT INTO query (id, name, sqlstatement) VALUES ('3', 'test', 'select * from team;');
