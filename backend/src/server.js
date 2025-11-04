const express = require("express");
const cors = require("cors");
const connection = require("./db_config");
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const port = 3000;

// ROTAS :::::::

// CADASTRO DE USUÁRIO

// Cadastrar
app.post('/usuario/cadastro', (request, response) => {
    let params = [
        request.body.usuario,
        request.body.email,
        request.body.nascimento,
        request.body.senha
    ];
    console.log(params)
    let query = "INSERT INTO usuario (usuario, email, nascimento, senha) VALUES (?, ?, ?, ?);";

    connection.query(query, params, (err, results) => {
        if (results) {
            response
                .status(201)
                .json({
                    success: true,
                    message: "Sucesso no cadastro",
                    data: params
                })
        } else {
            response.status(400).json({
                success: false,
                message: "Erro no cadastro",
                data: err
            });
        }
    });
});

// Listar
app.get('/usuario/listar', (request, response) => {
    const query = "SELECT * FROM usuario";

    connection.query(query, (err, results) => {
        if (results) {
            response
                .status(200)
                .json({
                    success: true,
                    message: "sucesso",
                    data: results
                })
        } else {
            response
                .status(400)
                .json({
                    success: false,
                    message: "sem sucesso",
                    data: err
                })
        }
    })
});

// Editar
app.put('/usuario/editar/:id', (request, response) => {
    const id = request.params.id;
    const { usuario, email, nascimento, senha } = request.body;

    const query = `
        UPDATE usuario 
        SET usuario = ?, email = ?, nascimento = ?, senha = ?
        WHERE id_usuario = ?;
    `;

    connection.query(query, [usuario, email, nascimento, senha, id], (err, results) => {
        if (err) {
            return response.status(400).json({
                success: false,
                message: "Erro ao atualizar o perfil",
                data: err
            });
        }
        response.status(200).json({
            success: true,
            message: "Perfil atualizado com sucesso!",
            data: results
        });
    });
});


// Deletar
app.delete('/usuario/deletar/:id', (request, response) => {
    let id = request.params.id;

    let query = "DELETE FROM usuario WHERE id_usuario = ?;"

    connection.query(query, [id], (err, results) => {
        if (results) {
            response
                .status(200)
                .json({
                    success: true,
                    message: "sucesso",
                    data: results
                })
        } else {
            response
                .status(400)
                .json({
                    success: false,
                    message: "sem sucesso",
                    data: err
                })
        }
    })
});

// LOGIN USUÁRIO

// Logar
app.post('/login', (request, res) => {
    let usuario = request.body.usuario
    let senha = request.body.senha

    const query = 'SELECT * FROM usuario WHERE email = ? AND senha = ?';

    connection.query(query, [usuario, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }
        if (results.length > 0) {
            res.json({
                success: true,
                message: 'Login bem-sucedido!',
                data: results[0] // agora 'data'
            });
        } else {
            res.json({ success: false, message: 'Usuário ou senha incorretos!' });
        }
    });
});

// RESPOSTAS

// Adicionar
app.post('/respostas', (req, res) => {
    const { post_id, autor, mensagem } = req.body;
    const sql = 'INSERT INTO respostas (post_id, autor, mensagem) VALUES (?, ?, ?)';
    connection.query(sql, [post_id, autor, mensagem], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, post_id, autor, mensagem });
    });
});

// Listar
app.get('/respostas/:post_id', (req, res) => {
    const { post_id } = req.params;
    const sql = 'SELECT id, autor, mensagem FROM respostas WHERE post_id = ? ORDER BY criado_em ASC';
    connection.query(sql, [post_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


// Editar
app.put('/respostas/:id', (req, res) => {
    const { id } = req.params;
    const { mensagem } = req.body;

    const sql = 'UPDATE respostas SET mensagem = ? WHERE id = ?';
    connection.query(sql, [mensagem, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao editar resposta', data: err });
        res.json({ success: true, message: 'Resposta atualizada com sucesso', data: result });
    });
});

// Excluir
app.delete('/respostas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM respostas WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir resposta', data: err });
        res.json({ success: true, message: 'Resposta excluída com sucesso', data: result });
    });
});

// POSTAGENS

// Criar
app.post('/posts', (req, res) => {
    const { autor, mensagem, id_user } = req.body;
    const sql = 'INSERT INTO posts (autor, mensagem, id_user) VALUES (?, ?, ?)';
    connection.query(sql, [autor, mensagem, id_user], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, autor, mensagem, id_user });
    });
});

// Listar
app.get('/posts', (req, res) => {
    connection.query('SELECT * FROM posts ORDER BY criado_em DESC', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Editar
app.put('/posts/:id', (req, res) => {
    const { id } = req.params;
    const { mensagem } = req.body;

    const sql = 'UPDATE posts SET mensagem = ? WHERE id = ?';
    connection.query(sql, [mensagem, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao editar postagem', data: err });
        res.json({ success: true, message: 'Postagem atualizada com sucesso', data: result });
    });
});

// Excluir
app.delete('/posts/:id', (req, res) => {
    const { id } = req.params;

    const delRespostas = 'DELETE FROM respostas WHERE post_id = ?';
    connection.query(delRespostas, [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir respostas', data: err });

        const delPost = 'DELETE FROM posts WHERE id = ?';
        connection.query(delPost, [id], (err2, result) => {
            if (err2) return res.status(500).json({ success: false, message: 'Erro ao excluir postagem', data: err2 });
            res.json({ success: true, message: 'Postagem excluída com sucesso', data: result });
        });
    });
});

// AGENDA (EVENTOS)

// Criar
app.post('/eventos/salvar', (request, response) => {
    const { id_usuario, dia, hora, descricao } = request.body;

    if (!id_usuario || !dia || !hora || !descricao) {
        return response.status(400).json({
            success: false,
            message: "Dados incompletos para salvar o evento."
        });
    }

    const params = [id_usuario, dia, hora, descricao];
    const query = "INSERT INTO eventos (id_usuario, dia, hora, descricao) VALUES (?, ?, ?, ?);";

    connection.query(query, params, (err, results) => {
        if (results) {
            response
                .status(201)
                .json({
                    success: true,
                    message: "Evento salvo com sucesso!",
                    data: { id: results.insertId, ...request.body }
                });
        } else {
            response.status(400).json({
                success: false,
                message: "Erro ao salvar evento no banco de dados.",
                data: err
            });
        }
    });
});

// Listar
app.get('/eventos/listar/:id_usuario', (request, response) => {
    const { id_usuario } = request.params;

    const query = "SELECT id_evento, dia, hora, descricao FROM eventos WHERE id_usuario = ? ORDER BY dia, hora ASC;";

    connection.query(query, [id_usuario], (err, results) => {
        if (results) {
            response
                .status(200)
                .json({
                    success: true,
                    message: "Eventos carregados com sucesso.",
                    data: results
                });
        } else {
            response
                .status(400)
                .json({
                    success: false,
                    message: "Erro ao buscar eventos.",
                    data: err
                });
        }
    });
});

// Editar
app.put('/agenda/evento/editar/:id', (request, response) => {
    const id = request.params.id;
    const { dia, hora, descricao } = request.body;

    if (!dia || !hora || !descricao) {
        return response.status(400).json({
            success: false,
            message: "Dados incompletos para a edição do evento."
        });
    }

    const query = `
        UPDATE eventos 
        SET dia = ?, hora = ?, descricao = ?
        WHERE id_evento = ?;
    `;

    connection.query(query, [dia, hora, descricao, id], (err, results) => {
        if (err) {
            return response.status(400).json({
                success: false,
                message: "Erro ao atualizar o evento",
                data: err
            });
        }
        response.status(200).json({
            success: true,
            message: "Evento atualizado com sucesso!",
            data: results
        });
    });
});

// Excluir
app.delete('/agenda/evento/deletar/:id', (request, response) => {
    let id = request.params.id;

    let query = "DELETE FROM eventos WHERE id_evento = ?;"

    connection.query(query, [id], (err, results) => {
        if (err) {
            return response.status(400).json({
                success: false,
                message: "Erro ao excluir evento",
                data: err
            });
        }

        if (results.affectedRows === 0) {
            return response.status(404).json({
                success: false,
                message: "Evento não encontrado."
            });
        }

        response.status(200).json({
            success: true,
            message: "Evento excluído com sucesso!",
            data: results
        });
    });
});

/* CHAT PRIVADO */

const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('Um usuário conectou:', socket.id);

    socket.on('user connected', (userId) => {
        const query = "SELECT id_usuario, usuario FROM usuario WHERE id_usuario = ?";
        connection.query(query, [userId], (err, results) => {
            if (err || results.length === 0) {
                console.error("Erro ao buscar usuário:", err);
                return;
            }

            const user = results[0];

            onlineUsers.set(user.id_usuario, { ...user, socketId: socket.id });
            socket.userId = user.id_usuario;

            // Atualiza a lista de usuários (sem incluir eles mesmos)
            onlineUsers.forEach((u, uid) => {
                const otherUsers = Array.from(onlineUsers.values()).filter(x => x.id_usuario !== uid);
                io.to(u.socketId).emit('update user list', otherUsers);
            });

            console.log('Usuários online:', Array.from(onlineUsers.values()));
        });
    });

    socket.on('get message history', ({ otherUserId }, callback) => {
        const currentUserId = socket.userId;

        const query = `
            SELECT id, sender_id, recipient_id, message, created_at 
            FROM private_messages 
            WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
            ORDER BY created_at ASC;
        `;

        const params = [currentUserId, otherUserId, otherUserId, currentUserId];

        connection.query(query, params, (err, results) => {
            if (err) {
                console.error("Erro ao buscar histórico:", err);
                callback({ error: "Erro ao buscar histórico." });
                return;
            }
            callback(results);
        });
    });

    socket.on('private message', ({ recipientId, text }) => {
        const senderId = socket.userId;
        const recipientData = onlineUsers.get(recipientId);

        const query = 'INSERT INTO private_messages (sender_id, recipient_id, message) VALUES (?, ?, ?)';
        const params = [senderId, recipientId, text];

        connection.query(query, params, (err, results) => {
            if (err) {
                console.error("Erro ao salvar mensagem:", err);
                return;
            }

            const message = {
                id: results.insertId,
                sender_id: senderId,
                recipient_id: recipientId,
                message: text,
                created_at: new Date()
            };

            if (recipientData) {
                io.to(recipientData.socketId).emit('private message received', message);
            }

            socket.emit('private message received', message);
        });
    });

    // Editar
    socket.on('edit private message', ({ messageId, newText }) => {
        const senderId = socket.userId;
        if (!senderId) return;

        const checkQuery = "SELECT sender_id, recipient_id FROM private_messages WHERE id = ?";
        connection.query(checkQuery, [messageId], (err, results) => {
            if (err || results.length === 0) {
                console.error("Erro ao buscar mensagem para editar:", err);
                return;
            }

            if (results[0].sender_id !== senderId) {
                console.warn(`Usuário ${senderId} tentou editar mensagem ${messageId} de outro usuário.`);
                return;
            }

            const updateQuery = "UPDATE private_messages SET message = ? WHERE id = ? AND sender_id = ?";
            connection.query(updateQuery, [newText, messageId, senderId], (updateErr, updateResults) => {
                if (updateErr) {
                    console.error("Erro ao atualizar mensagem:", updateErr);
                    return;
                }

                // Atualiza para os dois usuários
                const updatedMessage = {
                    id: messageId,
                    sender_id: senderId,
                    recipient_id: results[0].recipient_id,
                    message: newText
                };

                socket.emit('message updated', updatedMessage);

                const recipientSocket = onlineUsers.get(results[0].recipient_id);
                if (recipientSocket) {
                    io.to(recipientSocket.socketId).emit('message updated', updatedMessage);
                }
            });
        });
    });

    // Excluir
    socket.on('delete private message', ({ messageId }) => {
        const senderId = socket.userId;
        if (!senderId) return;

        const checkQuery = "SELECT sender_id, recipient_id FROM private_messages WHERE id = ?";
        connection.query(checkQuery, [messageId], (err, results) => {
            if (err || results.length === 0) {
                console.error("Erro ao buscar mensagem para deletar:", err);
                return;
            }

            if (results[0].sender_id !== senderId) {
                console.warn(`Usuário ${senderId} tentou deletar mensagem ${messageId} de outro usuário.`);
                return;
            }

            // Atualiza a mensagem para apagada
            const deletedText = '<i class="fa-solid fa-ban"></i> Mensagem apagada';
            const updateQuery = "UPDATE private_messages SET message = ? WHERE id = ? AND sender_id = ?";

            connection.query(updateQuery, [deletedText, messageId, senderId], (updateErr, updateResults) => {
                if (updateErr) {
                    console.error("Erro ao 'deletar' mensagem:", updateErr);
                    return;
                }

                const deletedMessage = {
                    id: messageId,
                    sender_id: senderId,
                    recipient_id: results[0].recipient_id,
                    message: deletedText
                };

                socket.emit('message updated', deletedMessage);

                const recipientSocket = onlineUsers.get(results[0].recipient_id);
                if (recipientSocket) {
                    io.to(recipientSocket.socketId).emit('message updated', deletedMessage);
                }
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou:', socket.id);
        if (socket.userId) {
            onlineUsers.delete(socket.userId);

            onlineUsers.forEach((u, uid) => {
                const otherUsers = Array.from(onlineUsers.values()).filter(x => x.id_usuario !== uid);
                io.to(u.socketId).emit('update user list', otherUsers);
            });

            console.log('Usuários online:', Array.from(onlineUsers.values()));
        }
    });

});

server.listen(port, () => {
    console.log(`Servidor rodando e ouvindo na porta ${port}`);
});