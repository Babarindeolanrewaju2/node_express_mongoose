const farmEquipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    hourlyRate: {
        type: Number,
        required: true,
    },
    available: {
        type: Boolean,
        default: true,
    },
});
const FarmEquipment = mongoose.model("FarmEquipment", farmEquipmentSchema);

const bookingSchema = new mongoose.Schema({
    equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FarmEquipment",
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    rentalCost: {
        type: Number,
        required: true,
    },
});
const Booking = mongoose.model("Booking", bookingSchema);

router.post("/booking", (req, res) => {
    const {
        equipmentId,
        startTime,
        endTime
    } = req.body;
    FarmEquipment.findById(equipmentId)
        .then((equipment) => {
            if (!equipment) {
                return res.status(404).json({
                    message: "Equipment not found"
                });
            }
            if (!equipment.available) {
                return res.status(400).json({
                    message: "Equipment not available"
                });
            }
            let rentalCost = 0;
            let rentalHours = (endTime - startTime) / 3600;
            rentalCost = rentalHours * equipment.hourlyRate;

            FarmEquipment.findByIdAndUpdate(equipmentId, {
                    available: false
                }, {
                    new: true
                })
                .then(() => {
                    const newBooking = new Booking({
                        equipmentId,
                        startTime,
                        endTime,
                        rentalCost
                    });
                    newBooking
                        .save()
                        .then((booking) => res.json(booking))
                        .catch((err) => res.status(400).json(err));
                })
                .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(404).json(err));
});

router.get("/equipment", (req, res) => {
    FarmEquipment.find()
        .then((equipment) => res.json(equipment))
        .catch((err) => res.status(400).json(err));
});

router.get("/booking", (req, res) => {
    Booking.find()
        .populate("equipmentId")
        .then((bookings) => res.json(bookings))
        .catch((err) => res.status(400).json(err));
});

router.patch("/equipment/:id", (req, res) => {
    const {
        name,
        description,
        hourlyRate,
        available
    } = req.body;
    FarmEquipment.findByIdAndUpdate(req.params.id, {
            name,
            description,
            hourlyRate,
            available
        }, {
            new: true
        })
        .then((equipment) => res.json(equipment))
        .catch((err) => res.status(400).json(err));
});

router.delete("/equipment/:id", (req, res) => {
    FarmEquipment.findByIdAndDelete(req.params.id)
        .then(() => res.json({
            message: "Equipment deleted"
        }))
        .catch((err) => res.status(400).json(err));
});

router.patch("/booking/:id", (req, res) => {
    const {
        startTime,
        endTime
    } = req.body;
    Booking.findByIdAndUpdate(req.params.id, {
            startTime,
            endTime
        }, {
            new: true
        })
        .then((booking) => res.json(booking))
        .catch((err) => res.status(400).json(err));
});

router.delete("/booking/:id", (req, res) => {
    Booking.findByIdAndDelete(req.params.id)
        .then((booking) => {
            FarmEquipment.findByIdAndUpdate(booking.equipmentId, {
                    available: true
                }, {
                    new: true
                })
                .then(() => res.json({
                    message: "Booking deleted"
                }))
                .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(400).json(err));
});

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");
const should = chai.should();
chai.use(chaiHttp);


describe("Bookings", () => {
    it("should create a new booking", (done) => {
        const equipment = {
            equipmentId: "5f89a09a3b3c8b3c908df567",
            startTime: "2022-08-01T12:00:00.000Z",
            endTime: "2022-08-01T16:00:00.000Z"
        };
        chai
            .request(server)
            .post("/booking")
            .send(equipment)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("rentalCost").eql(80);
                done();
            });
    });
});