const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
//Declarations
let dataDepartments = [];
let dataManager = [];
let dataRole = [];
let dataEmployee = [];
//mysql connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employee_db'
    }, 
    console.log('database connected!')
);
//Fancy Heading
console.log("                                                                               \r\n,---.          |                            --.--               |              \r\n|--- ,-.-.,---.|    ,---.,   .,---.,---.      |  ,---.,---.,---.|__\/ ,---.,---.\r\n|    | | ||   ||    |   ||   ||---\'|---\'      |  |    ,---||    |  \\ |---\'|    \r\n`---\'` \' \'|---\'`---\'`---\'`---|`---\'`---\'      `  `    `---^`---\'`   ``---\'`    \r\n          |              `---\'                                              ")
//Called everytime the user performs an action and at the start of the program
function promptMenu () {
    inquirer.prompt([
        {
            name: 'choice',
            type: 'list',
            message: "What would you like to do?",
            choices: [
                {name:'View All Employees', value:'1'},
                {name:'Add Employee', value:'2'},
                {name:'Update Employee Role', value:'3'},
                {name:'View all roles', value:'4'},
                {name:'Add role', value:'5'},
                {name:'View All Departments', value:'6'},
                {name:'Add Department', value:'7'},
                {name:'Exit', value:'8'},
            ]
        },            
    ]).then( choice => {
        switch (choice.choice){
            case '1':        
                queryEmployees();
                break;
            case '2':
                addEmployee();
                break;
            case '3':
                updateEmployeeRole();
                break; 
            case '4':
                queryRoles();
                break;
            case '5':
                addRoles();
                break;
            case '6':
                getDepartments(1);
                break;
            case '7':
                addDepartment();
                break;
            case '8': 
                process.exit();                                   
        }
    });
}
//Displayes employee table data formated
function queryEmployees(){
    db.query('SELECT employee.id, employee.first_name, employee.last_name, m.first_name AS manager_first, m.last_name AS manager_last, roles.title, roles.salary, department.department_name FROM employee LEFT OUTER JOIN employee AS m ON employee.manager_id = m.id INNER JOIN roles ON employee.role_id = roles.id INNER JOIN department ON roles.department_id = department.id ;', function (err, results) {       
        console.table(results);
        promptMenu();
    });      
} 
//Displays roles table data formated
function queryRoles(){
    db.query('SELECT roles.title, roles.id, department.department_name, roles.salary FROM roles INNER JOIN department ON roles.department_id = department.id;', function (err, results) {
        console.table(results);
        promptMenu();
    });
}
async function addEmployee(){
    await getRoles();
    await getManager();
    inquirer.prompt([
        {
            name: 'first_name',
            type: 'input',
            message: "what is the employee's first name?"
        },
        {
            name: 'last_name',
            type: 'input',
            message: "what is the employee's last name?"
        },
        {
            name: 'role',
            type: 'list',
            message: "what is the employee's role?",
            choices: dataRole             
        },
        {
            name: 'manager',
            type: 'list',
            message: "who is the employee's manager?",
            choices: dataManager            
        }        
    ]).then((data) => {
        const managerSelected = dataManager.find(x => x.name == data.manager);
        const roleSelected = dataRole.find(x => x.name == data.role);
        const params = [roleSelected["id"], managerSelected["id"], data.first_name, data.last_name];
        db.query('INSERT INTO employee (role_id, manager_id, first_name, last_name) VALUES (?, ?, ?, ?);', params, (err, result) => {
            if (err) throw err;
            console.log('Row Inserted!');
            promptMenu();
        })
    });
};
async function addRoles(){
    await getRoles();
    await getDepartments();

    inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: 'What is the title of the role you are adding?'
        },
        {
            name:'salary',
            type: 'input',
            message: 'What is the salary?'
        },
        {
            name: 'department',
            type: 'list',
            choices: dataDepartments
        }
    ]).then((results) => {
        const departmentSelected = dataDepartments.find(x => x.name == results["department"]);
        const params = [ results.title, results.salary , departmentSelected["id"]];
        db.query("INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)", params, (err, result) =>{
            if (err) throw err;
            console.log('Row Inserted!');
            promptMenu();
        })
    })
};
async function addDepartment(){
    await getDepartments();

    inquirer.prompt([
        {
            name: 'department_name',
            type: 'input',
            message: 'Please enter the name of the department to add to the database'
        },
    ]).then((results) => {
        db.query("INSERT INTO department (department_name) VALUES (?)", results["department_name"], (err, result) => {
            if (err) throw err;
            console.log('Row Inserted!');
            promptMenu();
        })
    })
};
async function updateEmployeeRole(){
    await getRoles();
    await getEmployeeData();
    inquirer.prompt([
        {
            name: 'employee_name',
            type: 'list',
            message: 'Please select the employee to update',
            choices: dataEmployee
        },
        {
            name: 'new_role',
            type: 'list',
            message: 'Whats the new role for the employee',
            choices: dataRole
        }
    ]).then((data)=> {
        //extract the data from objects
        const employeeSelected = dataEmployee.find(x => x.name == data.employee_name);
        const roleSelected = dataRole.find(x=> x.name == data.new_role)
        //query to update
        db.query('UPDATE employee SET role_id = ? WHERE employee.id = ?;', [roleSelected['id'], employeeSelected['id']], (err, result) => {
            if(err) throw err;
            console.log('Employee ' + employeeSelected['name'] + ' was updated!');
        })
    }) 
    
};
//The folowing functions are used solely for inquirer's promt list, all functions update the data(employees, roles and departments) arrays
getEmployeeData= async() => {
    await db.promise().query('SELECT CONCAT(first_name, " ", last_name) AS name, id FROM employee;').then((result) => {
        dataEmployee = result[0];
        console.log(dataEmployee);
    })
}
getRoles = async() => {
    await db.promise().query('SELECT title AS name, id FROM roles;').then((result) => {
        dataRole = result[0];
    })
}
getManager = async() => {
    await db.promise().query('SELECT last_name AS name, id AS id FROM employee;').then((result) => {
        dataManager = result[0];
    })
};
//hybrid function that updates inquirer's prompt list and also displays department table
getDepartments = async (...args) => {
    console.log('get dept called');
    await db.promise().query('SELECT department_name AS name, id FROM department;').then((result) => {
        dataDepartments = result[0]; 
        if(args[0] == 1){
            console.table(dataDepartments);
            promptMenu();            
        }   
    })    
};
//promptMenu called at start
promptMenu();