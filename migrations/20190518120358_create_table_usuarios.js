exports.up = function(knex, Promise) {
    return knex.schema.createTable('usuarios', table => {
        table.increments('id').notNull().primary()
        table.string('nome').notNull()
        table.string('email').notNull().unique()
        table.string('senha').notNull()
        table.string('celular').notNull()
        table.string('foto').notNull()
        table.boolean('ativo').notNull().defaultTo(false)
    })
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('usuarios')
}
