module.exports = app =>{
    const resources = app.api.resources;
    const auth = app.api.auth;
    const config = app.config;

    app.post('/signup',resources.usuarios.save)
    app.post('/signin',auth.signin)
    app.post('/validateToken', auth.validateToken)

    app.route('/usuarios')
        .all(config.passport.authenticate())
        .post(resources.usuarios.save)
        .get( resources.usuarios.get)

    app.route('/usuarios/:id')
        .all(config.passport.authenticate())
        .put(resources.usuarios.save)
        .get(resources.usuarios.getById)
        .delete(resources.usuarios.remove)
}