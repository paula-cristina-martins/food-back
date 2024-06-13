import { development } from "../../../knexfile";
import knex from "knex";

const connection = knex(development);

export default connection;
