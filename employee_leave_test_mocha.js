const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();
const Employee = require('../models/employee');
const Leave = require('../models/leave');

chai.use(chaiHttp);

describe('Leaves', () => {
    let employeeId = '';
    before(async () => {
        //create an employee
        const employee = new Employee({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'password',
            availableLeaveDays: 20
        });
        await employee.save();
        employeeId = employee._id;
    });

    after(async () => {
        //delete the employee and leave
        await Employee.deleteMany();
        await Leave.deleteMany();
    });

    it('it should create a leave request', (done) => {
        const leave = {
            startDate: '2022-10-01',
            endDate: '2022-10-15',
        };
        //login the employee
        chai.request(server)
            .post('/users/login')
            .send({
                email: 'johnd.com',
                password: 'password'
            })
            .end((err, loginRes) => {
                //save the token
                const token = loginRes.body.token;

                //make the request to create the leave
                chai.request(server)
                    .post('/leave')
                    .set('Authorization', `Bearer ${token}`)
                    .send(leave)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('employee');
                        res.body.employee.toString().should.be.eql(employeeId);
                        res.body.should.have.property('startDate');
                        res.body.startDate.should.be.eql(leave.startDate);
                        res.body.should.have.property('endDate');
                        res.body.endDate.should.be.eql(leave.endDate);
                        done();
                    });
            });
    });

    it('it should not create a leave request due to insufficient leave days', (done) => {
        const employee = new Employee({
            name: 'Jane Doe',
            email: 'janedoe@example.com',
            password: 'password',
            availableLeaveDays: 1
        });
        employee.save((err, employee) => {
            //login the employee
            chai.request(server)
                .post('/users/login')
                .send({
                    email: 'janedoe@example.com',
                    password: 'password'
                })
                .end((err, loginRes) => {
                    //save the token
                    const token = loginRes.body.token;
                    //make the request to create the leave
                    chai.request(server)
                        .post('/leave')
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            startDate: '2022-10-01',
                            endDate: '2022-10-15',
                        })
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.should.have.property('error');
                            done();
                        });
                });
        });
    });
});