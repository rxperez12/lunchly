/** Customer for Lunchly */

import db from "../db.js";
import Reservation from "./reservation.js";
import { formatName } from "../utils.js";

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
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

  /** Given an array of strings, return an array of customer instances that
   *  match the string contents.
   *
   *
   *
   * get a customer by name. Take in a string,
   * if only one name, return any matching customers,
   * for first or last name, if full name, search for entire name
   */
  static async getByName(name) {
    const formattedName = formatName(name);
    if (nameAsArr.length === 0) throw new Error();

    const result = await db.query(`
    SELECT id,
            first_name AS 'firstName',
            last_name AS 'lastName',
            phone,
            notes
    FROM customers
    WHERE first_name IN ($1, $2) OR last_name IN ($1, 2)
    ORDER BY first_name, last_name`,
      formattedName);
    const customers = results.rows;

    // now do stuff with the array!
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


  /** Returns a customer's first and last names joined by a space */
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }


}

export default Customer;
