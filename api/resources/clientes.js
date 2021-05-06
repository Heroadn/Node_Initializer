//const queries = require('./queries')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const save = async(req, res) => {
        var clientes = { ...req.body };
        //Recebendo o id o cliente
        if(req.params.id)  clientes.id = req.params.id
        //Recebendo o id do usuario
        if(req.user.id) clientes.usuarios_id = req.user.id;

        console.log(clientes.usuarios_id);
        try {
            existsOrError(clientes.nome, 'Nome não informado')
            existsOrError(clientes.email, 'E-mail não informado')
            existsOrError(clientes.senha, 'Senha não informada')
            existsOrError(clientes.confirmPassword, 'Confirmação de Senha inválida')
            existsOrError(clientes.celular, 'Celular não informado')

            const clientesFromDB = await app.db('clientes')
                .where({ email: clientes.email }).first()
            if(!clientes.id) {
                notExistsOrError(clientesFromDB, 'Cliente já cadastrado')
            }
        } catch(msg) {
            return res.status(400).send(msg)
        }

        clientes.senha = encryptPassword(clientes.senha)
        delete clientes.confirmPassword

        if(clientes.id){
            app.db('clientes')
                .update(clientes)
                .where({id:clientes.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }else{
            app.db('clientes')
                .insert(clientes)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const limit = 10 // usado para paginação
    const get = async(req, res) => {
        //console.log(req.user.id);
        const page = req.query.page || 1;

        const result = await app.db('clientes').count('id as count').first()
        const count = parseInt(result.count);

        app.db('clientes')
            .select('id','nome','email','celular','usuarios_id')
            .limit(limit).offset(page * limit - limit)
            .then(clientes => res.json({ Clientes: clientes, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('clientes')
            .where({id: req.params.id})
            .first()
            .then(clientes =>{
                clientes.content = content.toString();
                return res.json(clientes);
            })
            .catch(err => res.status(500).send(err))
    }

    const remove = async (req, res) => {
        try{
            const rowsDeleted = await app.db('clientes')
                .where({id:req.params.id}).del()

                try {
                    existsOrError(rowsDeleted, 'Cliente não encontrado.')
                } catch(msg) {
                    return res.status(400).send(msg)    
                }

                res.status(204).send()
        }catch(msg) {
            res.status(500).send(msg)
        }
    }

//Retorna os metodos
return { save, remove, get, getById}
}