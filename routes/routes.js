var express = require("express");
var passport = require("passport");
var flash = require("connect-flash");

var Admin = require("../models/admin");
var Contact = require("../models/contact");
var Hall = require("../models/halls");
var Reservation = require("../models/reservation");

var ensureAuthenticated = require("../auth/auth").ensureAuthenticated;

var router = express.Router();

router.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");
    next();
});

/* ********************************************************Customer Routes ******************************************************/
router.get("/", function (req, res) {
    res.render("user/index");
});

router.get("/about", function (req, res) {
    res.render("user/about");
})

router.get("/contact", function (req, res) {
    res.render("user/contact");
})

router.get("/halls", function (req, res) {

    Hall.find().exec(function (err, halls) {
        if (err) { console.log(err); }

        res.render("user/halls", { halls: halls });
    });

})

router.get("/reservation", function (req, res) {

    Hall.find().exec(function (err, halls) {
        if (err) { console.log(err); }

        res.render("user/reservation", { halls: halls });
    });
})

router.get("/login", function (req, res) {
    res.render("admin/login");
});

/************************************************************** Admin Routes ******************************************************/
router.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/contactList",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/contactList", ensureAuthenticated, function (req, res) {

    var sortBy = { submittedAt: -1 }; //{ name: 1 } ascending, { name: -1 } descending

    Contact.find().sort(sortBy).exec(function (err, contacts) {
        if (err) { console.log(err); }

        res.render("admin/pages/contactList", { contacts: contacts });
    });
});

router.get("/addHalls", ensureAuthenticated, function (req, res) {

    Hall.find().exec(function (err, halls) {
        if (err) { console.log(err); }

        res.render("admin/pages/addHalls", { halls: halls });
    });

});

router.get("/eventsList", ensureAuthenticated, function (req, res) {
    res.render("admin/pages/eventsList");
});

router.get("/calendar", ensureAuthenticated, function (req, res) {
    res.render("admin/pages/calendar");
});

/*********************************************************** Contact Form Submission **************************************************/
router.post("/addContact", function (req, res) {

    var newContact = new Contact({
        name: req.body.contactName,
        email: req.body.contactEmail,
        message: req.body.contactMessage,
        status: req.body.contactStatus
    });

    newContact.save(function (err, post) {
        if (err) { console.log(err); }
        res.redirect("/contact");
    });

});

/******************************************************* Contact Form Response Update **************************************************/
router.post("/updateContactList", async function (req, res) {

    const contact = await Contact.findById(req.body.contactId);

    contact.status = req.body.contactStatus;

    try {
        let updateContact = await contact.save();
        //console.log("updatecontact", updateContact);
        res.redirect("/contactList");
    } catch (err) {
        console.log("error occured");
        res.status(500).send(err);
    }

});

/******************************************************** Add Hall Form Submission **************************************************/
router.post("/manageHall", function (req, res) {

    var newHall = new Hall({
        name: req.body.hallName,
        seatingPlan: req.body.seatingPlan,
        hallType: req.body.hallType,
        capacity: req.body.hallCapacity,
        lightingSystem: req.body.lightingSystem,
        soundSystem: req.body.soundingSystem,
        buffet: req.body.buffet,
        priceFrom: req.body.priceFrom,
        priceTo: req.body.priceTo,
        description: req.body.hallDescription
    })

    newHall.save(function (err, post) {
        if (err) { console.log(err); }
        res.redirect("/addHalls");
    });

});

/******************************************************** Reservation Form Submission **************************************************/
router.post("/makeReservation", function (req, res) {

    var newReservation = new Reservation({
        title: req.body.personTitle,
        firstname: req.body.personFirstName,
        lastname: req.body.personLastName,
        nic: req.body.personNic,
        address: req.body.personAddress,
        contact: req.body.personContact,
        email: req.body.personEmail,
        hallType: req.body.hallType,
        eventDate: req.body.eventDate,
        eventTime: req.body.eventTime,
        message: req.body.optionalMessage,
    })

    newReservation.save(function (err, post) {
        if (err) { console.log(err); }
        res.redirect("/reservation");
    });

});

module.exports = router;
