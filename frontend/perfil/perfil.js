document.addEventListener("DOMContentLoaded", () => {
    const dados = JSON.parse(localStorage.getItem("Informacoes"));

    if (!dados) {
        alert("Nenhum usuário logado!");
        window.location.href = "../login/login.html";
        return;
    }

    let senhaReal = dados.senha || "";
    let senhaVisivel = false;

    const nomeSpan = document.getElementById("nome");
    const nascimentoSpan = document.getElementById("nascimento");
    const emailSpan = document.getElementById("email");
    const senhaSpan = document.getElementById("senha");
    const visualizarBtn = document.getElementById('visualizar');
    const olhoIcon = document.getElementById("olho");
    const modal = document.getElementById("modalEditar");
    
    const editSenhaInput = document.getElementById("editSenha");
    const visualizarModalBtn = document.getElementById('visualizarModal');
    const olhoModalIcon = document.getElementById('olhoModal');

    function atualizarExibicaoSenha() {
        const tamanhoSenha = senhaReal.length > 0 ? senhaReal.length : 8;
        
        if (senhaVisivel) {
            senhaSpan.textContent = senhaReal;
            olhoIcon.className = 'fa-solid fa-eye fa-1xl';
        } else {
            // asteriscos
            senhaSpan.textContent = "*".repeat(tamanhoSenha);
            olhoIcon.className = 'fa-solid fa-eye-slash fa-1xl';
        }
    }

    nomeSpan.textContent = dados.usuario || "";
    nascimentoSpan.textContent = dados.nascimento
        ? new Date(dados.nascimento).toLocaleDateString('pt-BR')
        : "";
    emailSpan.textContent = dados.email || "";
    
    atualizarExibicaoSenha(); 

    // Sair
    document.getElementById("btnSair").addEventListener("click", () => {
        localStorage.removeItem("Informacoes");
        window.location.href = "../login/login.html";
    });

    visualizarBtn.addEventListener('click', () => {
        senhaVisivel = !senhaVisivel; // Inverte o estado
        atualizarExibicaoSenha();     // Atualiza a tela
    });

    visualizarModalBtn.addEventListener('click', () => {
        if (editSenhaInput.type === "password") {
            editSenhaInput.type = "text";
            olhoModalIcon.className = 'fa-solid fa-eye fa-1xl';
        } else {
            editSenhaInput.type = "password";
            olhoModalIcon.className = 'fa-solid fa-eye-slash fa-1xl';
        }
    });

    // Abrir modal de edição
    const btnEditar = document.getElementById("editarPerfil");
    const closeModal = document.querySelector(".close");

    btnEditar.addEventListener("click", () => {
        document.getElementById("editNome").value = dados.usuario;
        document.getElementById("editEmail").value = dados.email;
        editSenhaInput.value = senhaReal;

        editSenhaInput.type = "password";
        olhoModalIcon.className = 'fa-solid fa-eye-slash fa-1xl';
        
        modal.style.display = "block";
    });

    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    // Enviar alterações
    document.getElementById("formEditar").addEventListener("submit", async (e) => {
        e.preventDefault();

        const novoNome = document.getElementById("editNome").value;
        const novoEmail = document.getElementById("editEmail").value;
        const novaSenha = editSenhaInput.value;

        try {
            const response = await fetch(`http://localhost:3000/usuario/editar/${dados.id_usuario}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: novoNome,
                    email: novoEmail,
                    nascimento: dados.nascimento,
                    senha: novaSenha
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("Informações atualizadas com sucesso!");

                dados.usuario = novoNome;
                dados.email = novoEmail;
                dados.senha = novaSenha;
                localStorage.setItem("Informacoes", JSON.stringify(dados));

                nomeSpan.textContent = novoNome;
                emailSpan.textContent = novoEmail;
                senhaReal = novaSenha;
                
                senhaVisivel = false; 
                atualizarExibicaoSenha(); 

                modal.style.display = "none";
            } else {
                alert("Erro ao atualizar: " + result.message);
            }
        } catch (error) {
            console.error("Erro ao enviar atualização:", error);
            alert("Erro ao atualizar perfil.");
        }
    });
});