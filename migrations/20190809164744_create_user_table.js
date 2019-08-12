
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('user', t => {
        t.increments('id').unsigned().primary();
        t.string('email').notNull();
        t.string('password_digest').notNull();
    })
    .createTable('staffs', t => {
        t.increments('id').unsigned().primary();
        t.string('name').notNull();
        t.string('position').notNull();
    })
    .createTable('locations', t => {
        t.increments('id').unsigned().primary();
        t.string('name').notNull();
    })
    .createTable('departments', t => {
        t.increments('id').unsigned().primary();
        t.string('name').notNull();
        t.integer('location_fk').references("id").inTable("locations")
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('user')
        .dropTable('staffs')
        .dropTable('departments')
        .dropTable('locations');
};
