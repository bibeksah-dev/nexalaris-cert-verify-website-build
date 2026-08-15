/**
 * The Postgres schema this app owns.
 *
 * The Supabase project is shared with the Nexalaris Hub, which owns `public`
 * and applies migrations there. Keeping the certificate tables in their own
 * schema is what stops the Hub's grant changes from reaching them.
 *
 * Every Supabase client must pass this as `db.schema`; `.from("certificates")`
 * call sites stay unqualified.
 */
export const DB_SCHEMA = "cert"
