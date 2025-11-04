create database mamae_a_bordo;
use mamae_a_bordo;

create table usuario (
	id_usuario int auto_increment unique primary key,
    usuario varchar(255) unique,
    email varchar(255) unique, 
    nascimento date,
    senha varchar(45)
);

select * from usuario;

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  autor VARCHAR(100),
  mensagem TEXT,
  id_user INT,
  foreign key (id_user) references usuario(id_usuario),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

select * from posts;

CREATE TABLE respostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT,
  autor VARCHAR(100),
  mensagem TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

select * from respostas;

CREATE TABLE eventos (
	id_evento int auto_increment primary key,
	id_usuario int not null,
    dia date not null,
    hora time not null,
    descricao varchar(255) not null,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

select * from eventos;

CREATE TABLE private_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES usuario(id_usuario),
    FOREIGN KEY (recipient_id) REFERENCES usuario(id_usuario)
);

select * from private_messages;