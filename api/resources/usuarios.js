//const queries = require('./queries')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const save = async(req, res) => {
        //Recebe o usuario da requisição, e o rest operator pegua os argumentos e adiciona ao objeto usuario
        var usuario = { ...req.body };
        if(req.params.id)  usuario.id = req.params.id

        try {
            existsOrError(usuario.nome, 'Nome não informado')
            existsOrError(usuario.email, 'E-mail não informado')
            existsOrError(usuario.senha, 'Senha não informada')
            existsOrError(usuario.confirmPassword, 'Confirmação de Senha inválida')
            equalsOrError(usuario.senha, usuario.confirmPassword,
                'Senhas não conferem')

            const usuarioFromDB = await app.db('usuarios')
                .where({ email: usuario.email }).first()
            if(!usuario.id) {
                notExistsOrError(usuarioFromDB, 'Usuário já cadastrado')
            }
        } catch(msg) {
            return res.status(400).send(msg)
        }

        usuario.senha = encryptPassword(usuario.senha)
        delete usuario.confirmPassword

        if(usuario.id){
            app.db('usuarios')
                .update(usuario)
                .where({id:usuario.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }else{
            app.db('usuarios')
                .insert(usuario)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const limit = 10 // usado para paginação
    const get = async(req, res) => 
    {
        //console.log(req.user.id);
        const page = req.query.page || 1;

        const result = await app.db('usuarios').count('id as count').first()
        const count = parseInt(result.count);

        app.db('usuarios')
            .select('id','nome','email','celular')
            .limit(limit).offset(page * limit - limit)
            .then(usuarios => res.json({ Usuarios: usuarios, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('usuarios')
            .where({id: req.params.id})
            .first()
            .then(usuarios =>{
                usuarios.content = content.toString();
                return res.json(usuarios);
            })
            .catch(err => res.status(500).send(err))
    }

    const remove = async (req, res) => {
        try{
            const rowsDeleted = await app.db('usuarios')
                .where({id:req.params.id}).del()

                try {
                    existsOrError(rowsDeleted, 'Usuario não encontrado.')
                } catch(msg) {
                    return res.status(400).send(msg)    
                }

                res.status(204).send()
        }catch(msg) {
            res.status(500).send(msg)
        }
    }

    const savePhoto = (path,req) =>{
        if(req.user.id) {
            var usuario = {id: req.user.id, foto: path}
        }

        app.db('usuarios')
                .update(usuario)
                .where({id:usuario.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
    }

//Retorna os metodos
return { save, remove, get, getById,savePhoto}
}