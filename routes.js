/** Routes for Lunchly */

import express from "express";

import { BadRequestError } from "./expressError.js";
import Customer from "./models/customer.js";
import Reservation from "./models/reservation.js";

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  const customers = await Customer.all();
  return res.render("customer_list.jinja", { customers });
});


/** Handle search for customers. */

// TODO: friendlier way of handling: if no search params, render all customers
router.get('/name/', async function (req, res, next) {
  const customerName = req.query.search;

  if (!req.query.search) {
    throw new BadRequestError("Please enter a query in the search bar.");
  }
  const customers = await Customer.getByName(customerName);
  return res.render("customer_list.jinja", { customers });

});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.jinja");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Display the ten customers who have the most reservations. */

router.get('/top-ten/', async function (req, res, next) {

  // getting an arr of instance objs
  const customers = await Customer.getTopCustomers();

  return res.render("top_ten_list.jinja", { customers });
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.jinja", { customer, reservations });
});


/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.jinja", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save(); //TODO: add flash message after successfully added reservation

  return res.redirect(`/${customerId}/`);
});

export default router;
