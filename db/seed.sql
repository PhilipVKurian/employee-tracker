INSERT INTO department (id, department_name)
VALUES (1, "Rick and Morty appreciation"),
       (2, "Video gaming 101"),
       (3, "Forestry"),
       (4, "How Unemployed succesfully"),
       (5, "UofT bootcamp");


INSERT INTO roles(id, title, salary, department_id)
VALUES (12, "Engineer", 133456.55, 2),
       (11, "Teacher", 73456.55, 1),
       (10, "Lumberjack", 100456.55, 3),
       (9, "Philosopher", 0.55, 4),
       (8, "Instructor", 83456.55, 5);

INSERT INTO employee(id, first_name, last_name, role_id, manager_id)
VALUES (122, "Bob", "Lingus", 12 , 122),
       (192, "Taranke", "Naidu", 9 , 192),
       (1234, "Harry", "Gato", 10 , 1234),
       (12, "Harambe", "Lingusson", 8 , 12),
       (142, "Bob", "Lingusson Junior", 8 , 12);  