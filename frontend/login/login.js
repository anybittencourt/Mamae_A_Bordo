// Botão de login
async function login(event) {
    event.preventDefault();
 
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
 
    const data = {usuario, senha};

    const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
    })

    let results = await response.json();
    console.log("resultados response", response)
    console.log("resultados results", results)

    if (results.success) {
        alert(results.message)
        
        localStorage.setItem('username', results.data.usuario); 

        localStorage.setItem("Informacoes", JSON.stringify(results.data));

        window.location.href='../principal/principal.html';

    } else {
        alert(results.message); 
        console.log(results.message);
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