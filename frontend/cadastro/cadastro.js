// Botão de cadastrar
async function cadastrar(event) {
    event.preventDefault()
    const usuario = document.getElementById("usuario").value
    const email = document.getElementById("email").value
    const nascimento = document.getElementById("nascimento").value
    const senha = document.getElementById("senha").value

    const data = { usuario, email, nascimento, senha }
    console.log(data)

    const response = await fetch('http://localhost:3000/usuario/cadastro', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    const results = await response.json();
    console.log("resultados response", response)
    console.log("resultados results", results)

    if (results.success) {
        alert(results.message)
        window.location.href='../login/login.html'
        console.log(results.data)
        localStorage.setItem("Informacoes", JSON.stringify(results.data))
    } else {
        console.log(results.message)
    }
}

// Olho
const visualizar = document.getElementById('visualizar')
const input = document.getElementById("senha")
const olho = document.getElementById("olho")

visualizar.addEventListener('click',() => {
    if (input.type === "password") {
        input.type = "text";
        olho.className = 'fa-solid fa-eye fa-1xl'

   } else {
        input.type = "password";
        olho.className = 'fa-solid fa-eye-slash fa-1xl'
   }

})