document.addEventListener("DOMContentLoaded", () => {
  const postInput = document.querySelector(".form-post input");
  const postButton = document.querySelector(".form-post button");
  const main = document.querySelector("main");

  const modalResposta = document.getElementById("modalResposta");
  const closeModalResposta = document.querySelector(".fechar-modal");
  const enviarResposta = document.getElementById("enviarResposta");

  const modalEditarPost = document.getElementById("modalEditarPost");
  const closeModalPost = document.querySelector(".fechar-modal-post");
  const salvarEdicaoPost = document.getElementById("salvarEdicaoPost");

  const modalEditarResposta = document.getElementById("modalEditarResposta");
  const closeModalResp = document.querySelector(".fechar-modal-resposta");
  const salvarEdicaoResp = document.getElementById("salvarEdicaoResposta");

  let postAtualId = null;
  let respostaAtualId = null;

  const dados = JSON.parse(localStorage.getItem("Informacoes")) || {
    usuario: "Anônimo",
    id_usuario: null,
  };

  fetch("http://localhost:3000/posts")
    .then((r) => r.json())
    .then((posts) => posts.forEach((p) => renderPostagem(p)));

  // Criar nova postagem
  postButton.addEventListener("click", async () => {
    const texto = postInput.value.trim();
    if (!texto) return;

    const novo = {
      autor: dados.usuario,
      mensagem: texto,
      id_user: dados.id_usuario || null,
    };

    const res = await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });

    const criado = await res.json();
    renderPostagem(criado);
    postInput.value = "";
  });

  function renderPostagem(post) {
    const postEl = document.createElement("section");
    postEl.classList.add("post");
    postEl.innerHTML = `
      <div class="user-info"><strong>${post.autor}</strong></div>
      <p class="mensagem">${post.mensagem}</p>
      ${post.id_user === dados.id_usuario
        ? `
        <div class="acoes">
          <i class="fa-solid fa-pen-to-square editar-post" data-id="${post.id}"></i>
          <i class="fa-solid fa-trash excluir-post" data-id="${post.id}"></i>
        </div>`
        : ""
      }
      <a href="#" class="responder" data-id="${post.id}">Responder</a>
      <div class="comentarios"></div>
    `;

    main.insertBefore(postEl, document.querySelector(".form-post"));
    const comentarios = postEl.querySelector(".comentarios");

    // Carregar respostas
    fetch(`http://localhost:3000/respostas/${post.id}`)
      .then((r) => r.json())
      .then((respostas) => {
        comentarios.innerHTML = "";
        respostas.forEach((rp) => {
          const respostaEl = document.createElement("div");
          respostaEl.classList.add("resposta-item");
          respostaEl.dataset.id = rp.id;
          respostaEl.innerHTML = `
            <p>
              <strong>${rp.autor}:</strong>
              <span class="texto-resposta">${rp.mensagem}</span>
              ${rp.autor === dados.usuario
              ? `
              <span class="acoes-resposta">
                <i class="fa-solid fa-pen-to-square editar-resposta" data-id="${rp.id}"></i>
                <i class="fa-solid fa-trash excluir-resposta" data-id="${rp.id}"></i>
              </span>`
              : ""
            }
            </p>
          `;
          comentarios.appendChild(respostaEl);
        });
      });

    // Abrir modal de resposta
    postEl.querySelector(".responder").addEventListener("click", (e) => {
      e.preventDefault();
      modalResposta.style.display = "flex";
      postAtualId = post.id;
    });

    // Editar postagem
    const btnEditar = postEl.querySelector(".editar-post");
    if (btnEditar) {
      btnEditar.addEventListener("click", () => {
        postAtualId = post.id;
        modalEditarPost.style.display = "flex";
        document.getElementById("editarPostTexto").value =
          postEl.querySelector(".mensagem").textContent;
      });
    }

    // Excluir postagem
    const btnExcluir = postEl.querySelector(".excluir-post");
    if (btnExcluir) {
      btnExcluir.addEventListener("click", async () => {
        if (!confirm("Excluir esta postagem?")) return;
        await fetch(`http://localhost:3000/posts/${post.id}`, {
          method: "DELETE",
        });
        postEl.remove();
      });
    }

    comentarios.addEventListener("click", async (e) => {
      // Editar resposta
      if (e.target.classList.contains("editar-resposta")) {
        respostaAtualId = e.target.dataset.id;
        const texto = e.target
          .closest("p")
          .querySelector(".texto-resposta").textContent;
        document.getElementById("editarRespostaTexto").value = texto;
        modalEditarResposta.style.display = "flex";
      }

      // Excluir resposta
      if (e.target.classList.contains("excluir-resposta")) {
        const id = e.target.dataset.id;
        if (!confirm("Excluir esta resposta?")) return;
        await fetch(`http://localhost:3000/respostas/${id}`, {
          method: "DELETE",
        });
        e.target.closest(".resposta-item").remove();
      }
    });
  }

  // Enviar nova resposta
  enviarResposta.addEventListener("click", async () => {
    const nome = dados.usuario;
    const texto = document.getElementById("respostaTexto").value.trim();
    if (!texto) return;

    const res = await fetch("http://localhost:3000/respostas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: postAtualId,
        autor: nome,
        mensagem: texto,
      }),
    });

    const nova = await res.json();

    const comentarios = [...document.querySelectorAll(".post")]
      .find((p) => p.querySelector(".responder").dataset.id == postAtualId)
      .querySelector(".comentarios");

    const respostaEl = document.createElement("div");
    respostaEl.classList.add("resposta-item");
    respostaEl.dataset.id = nova.id;
    respostaEl.innerHTML = `
      <p>
        <strong>${nome}:</strong>
        <span class="texto-resposta">${texto}</span>
        <span class="acoes-resposta">
          <i class="fa-solid fa-pen-to-square editar-resposta" data-id="${nova.id}"></i>
          <i class="fa-solid fa-trash excluir-resposta" data-id="${nova.id}"></i>
        </span>
      </p>
    `;
    comentarios.appendChild(respostaEl);

    modalResposta.style.display = "none";
    document.getElementById("respostaTexto").value = "";
  });

  // Salvar edição da postagem
  salvarEdicaoPost.addEventListener("click", async () => {
    const novoTexto = document.getElementById("editarPostTexto").value.trim();
    if (!novoTexto) return;

    await fetch(`http://localhost:3000/posts/${postAtualId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: novoTexto }),
    });

    document
      .querySelector(`.editar-post[data-id="${postAtualId}"]`)
      .closest(".post")
      .querySelector(".mensagem").textContent = novoTexto;

    modalEditarPost.style.display = "none";
  });

  // Salvar edição da resposta
  salvarEdicaoResp.addEventListener("click", async () => {
    const novoTexto = document
      .getElementById("editarRespostaTexto")
      .value.trim();
    if (!novoTexto) return;

    const res = await fetch(
      `http://localhost:3000/respostas/${respostaAtualId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: novoTexto }),
      }
    );

    const result = await res.json();
    if (result.success) {
      document
        .querySelector(`.editar-resposta[data-id="${respostaAtualId}"]`)
        .closest(".resposta-item")
        .querySelector(".texto-resposta").textContent = novoTexto;
    }

    modalEditarResposta.style.display = "none";
  });

  // Fechar modais
  closeModalResposta.onclick = () => (modalResposta.style.display = "none");
  closeModalPost.onclick = () => (modalEditarPost.style.display = "none");
  closeModalResp.onclick = () => (modalEditarResposta.style.display = "none");

  window.onclick = (e) => {
    if (
      e.target === modalResposta ||
      e.target === modalEditarPost ||
      e.target === modalEditarResposta
    ) {
      e.target.style.display = "none";
    }
  };
});