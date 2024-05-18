/** Customer for Lunchly */

import db from "../db.js";
import Reservation from "./reservation.js";
import { formatName } from "../utils.js";

const TOP_CUSTOMER_COUNT = 10;

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
    this.reservations = null;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           ORDER BY last_name, first_name`,
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
      [id],
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** Given a string of customer name, query database for matching customers.
   *  If only one name is provided, return any matching customers for first or
   *  last name. If full name is provided, return customer whose full name
   *  matches.
   */
  static async getByName(name) {
    const formattedName = formatName(name);
    let results;
    if (formattedName.length === 1) {
      results = await db.query(
        `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
          FROM customers
          WHERE first_name= $1 OR last_name = $1
          ORDER BY first_name, last_name`,
        [formattedName[0]]);
    }

    if (formattedName.length === 2) {
      results = await db.query(
        `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
          FROM customers
          WHERE first_name IN ($1, $2) AND last_name IN ($1, $2)
          ORDER BY first_name, last_name`,
        [formattedName[0], formattedName[1]]);
    }
    if (results.length === 0) {
      const err = new Error(`No such customer(s): ${name}`);
      err.status = 404;
      throw err;
    }

    return results.rows.map(c => new Customer(c));
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`, [
        this.firstName,
        this.lastName,
        this.phone,
        this.notes,
        this.id,
      ],
      );
    }
  }

  /** Get first ten customers who have the most reservations.
   *  Return array of objects with customer instances and reservation counts.
   *
   * [ {customer: {...}, reservations: num}, ...]
  */

  static async getTopCustomers() {

    const results = await db.query(
      `SELECT first_name AS "firstName",
              last_name AS "lastName",
              phone,
              customers.notes,
              customers.id
        FROM customers
        JOIN reservations ON customers.id = reservations.customer_id
        GROUP BY customers.id
        ORDER BY COUNT(*) desc
        LIMIT $1`,
      [TOP_CUSTOMER_COUNT]
    );

    const customerPromises = results.rows.map(async function (c) {
      let customer = new Customer(c);
      customer.reservations = await customer.getReservations();
      return customer;
    }
    );
    const customerResolved = await Promise.allSettled(customerPromises);

  }


  /** Returns a customer's first and last names joined by a space */
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }


}

export default Customer;
