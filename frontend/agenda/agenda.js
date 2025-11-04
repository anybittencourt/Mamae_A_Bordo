const calendarBody = document.getElementById("calendar-body");
const monthYear = document.getElementById("monthYear");
const eventList = document.getElementById("event-list");
const noEventMsg = document.getElementById("no-event");

const modal = document.getElementById("modal");
const openForm = document.getElementById("openForm");
const closeForm = document.getElementById("closeForm");
const saveEvent = document.getElementById("saveEvent");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const eventDescriptionInput = document.getElementById("event-description");
const eventTimeInput = document.getElementById("event-time");
const eventDateInput = document.getElementById("event-date");

let selectedDate = new Date();
let events = {};

const usuarioLogado = JSON.parse(localStorage.getItem("Informacoes"));
let ID_USUARIO = null;

if (usuarioLogado && usuarioLogado.id_usuario) {
    ID_USUARIO = usuarioLogado.id_usuario;
} else {
    alert("Você precisa estar logada para acessar a agenda.");
}

const eventIdInput = document.createElement('input');
eventIdInput.type = 'hidden';
eventIdInput.id = 'edit-event-id';
document.getElementById('modal-form').appendChild(eventIdInput);

// Gerar data
function generateCalendar(date) {
    calendarBody.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    let row = document.createElement("tr");

    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement("td"));
    }

    // Preenche os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
            calendarBody.appendChild(row);
            row = document.createElement("tr");
        }

        const cell = document.createElement("td");
        cell.textContent = day;
        cell.classList.add("day");

        const currentDate = new Date(year, month, day);
        const isToday = currentDate.toDateString() === new Date().toDateString();

        if (isToday) {
            cell.classList.add("today");
        }

        // Verifica se há eventos para este dia
        const eventKey = currentDate.toDateString();
        if (events[eventKey] && events[eventKey].length > 0) {
            cell.classList.add("has-event");
        }

        if (isSameDate(currentDate, selectedDate)) {
            cell.classList.add("selected");
        }

        cell.onclick = () => {
            document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));

            selectedDate = currentDate;
            cell.classList.add("selected");
            displayEvents();
        };

        row.appendChild(cell);
    }

    if (row.children.length > 0) {
        while (row.children.length < 7) {
            row.appendChild(document.createElement("td"));
        }
        calendarBody.appendChild(row);
    }
}

function isSameDate(d1, d2) {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}

// Mostrar eventos
function displayEvents() {
    const key = selectedDate.toDateString();
    const currentEvents = events[key] || [];

    eventList.innerHTML = "";

    if (currentEvents.length > 0) {
        noEventMsg.style.display = 'none'; // Esconde a mensagem "Nenhum evento..."

        // Ordena por hora
        currentEvents.sort((a, b) => a.time.localeCompare(b.time));

        currentEvents.forEach(event => {
            const listItem = document.createElement("li");

            const formattedDate = selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

            listItem.innerHTML = `
                <div class="event-details">
                    <p>${formattedDate} - ${event.desc}, ${event.time}</p>
                </div>
                <div class="event-actions">
                    <button class="edit-btn" onclick="openEditModal(${event.id}, '${event.desc.replace(/'/g, "\\'")}', '${event.time}', '${selectedDate.toISOString().split('T')[0]}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteEvent(${event.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            eventList.appendChild(listItem);
        });

    } else {
        noEventMsg.style.display = 'flex';
    }
}

// Carregamento de eventos
async function fetchAllUserEvents() {
    if (!ID_USUARIO) return;

    try {
        const response = await fetch(`http://localhost:3000/eventos/listar/${ID_USUARIO}`);
        const result = await response.json();

        if (result.success) {
            events = {};

            result.data.forEach(ev => {
                const [year, month, day] = ev.dia.split('T')[0].split('-');
                const correctDate = new Date(year, month - 1, day);

                const key = correctDate.toDateString();

                if (!events[key]) {
                    events[key] = [];
                }

                const time = ev.hora.substring(0, 5);

                events[key].push({
                    desc: ev.descricao,
                    time: time,
                    id: ev.id_evento
                });
            });

            generateCalendar(selectedDate);
            displayEvents();
        } else {
            console.error("Erro ao carregar eventos:", result.message);
        }
    } catch (error) {
        console.error("Erro de rede ao carregar eventos:", error);
    }
}

// Modal
function resetModalForAdd() {
    eventDescriptionInput.value = '';
    eventTimeInput.value = '';
    eventDateInput.value = selectedDate.toISOString().split('T')[0];

    eventIdInput.value = '';

    document.querySelector('.modal-content h3').textContent = 'Adicionar Evento';
    saveEvent.textContent = 'Salvar';
    saveEvent.onclick = saveNewEvent;
}

// Abrir o modal de Adicionar
openForm.onclick = function () {
    resetModalForAdd();
    modal.style.display = "block";
}

// Fechar modal
closeForm.onclick = function () {
    modal.style.display = "none";
    resetModalForAdd();
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        resetModalForAdd();
    }
}

// Salvar novo evento
async function saveNewEvent() {
    if (!ID_USUARIO) {
        alert("ID do usuário não encontrado. Faça login novamente.");
        return;
    }

    const dia = eventDateInput.value;
    const hora = eventTimeInput.value;
    const descricao = eventDescriptionInput.value;

    if (!dia || !hora || !descricao) {
        alert("Todos os campos são obrigatórios.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/eventos/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_usuario: ID_USUARIO,
                dia,
                hora,
                descricao
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Evento salvo com sucesso!");
            modal.style.display = 'none';
            fetchAllUserEvents();
        } else {
            alert(`Erro ao salvar evento: ${result.message}`);
        }
    } catch (error) {
        console.error("Erro de rede ao salvar evento:", error);
        alert("Erro de conexão com o servidor ao salvar evento.");
    }
}

saveEvent.onclick = saveNewEvent;

// Modal de edição
function openEditModal(id, desc, time, date) {
    document.querySelector('.modal-content h3').textContent = 'Editar Evento';

    eventDescriptionInput.value = desc;
    eventTimeInput.value = time;
    eventDateInput.value = date;

    eventIdInput.value = id;

    saveEvent.textContent = 'Salvar';
    saveEvent.onclick = saveEditedEvent;
    modal.style.display = 'block';
}

// salva o evento editado
async function saveEditedEvent() {
    const id = eventIdInput.value;
    const dia = eventDateInput.value;
    const hora = eventTimeInput.value;
    const descricao = eventDescriptionInput.value;

    if (!id || !dia || !hora || !descricao) {
        alert("Erro: Dados incompletos para edição.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/agenda/evento/editar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dia, hora, descricao })
        });

        const result = await response.json();

        if (result.success) {
            alert("Evento editado com sucesso!");
            modal.style.display = 'none';
            fetchAllUserEvents();
            resetModalForAdd();
        } else {
            alert(`Erro ao editar evento: ${result.message}`);
        }
    } catch (error) {
        console.error("Erro de rede ao editar evento:", error);
        alert("Erro de conexão com o servidor ao editar evento.");
    }
}

// Deletar evento
async function deleteEvent(eventId) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/agenda/evento/deletar/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            alert("Evento excluído com sucesso!");
            fetchAllUserEvents();
        } else {
            alert(`Erro ao excluir evento: ${result.message}`);
        }
    } catch (error) {
        console.error("Erro de rede ao deletar evento:", error);
        alert("Erro de conexão com o servidor ao deletar evento.");
    }
}

// mudar os meses
prevMonthBtn.onclick = () => {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
    generateCalendar(selectedDate);
    displayEvents();
};

nextMonthBtn.onclick = () => {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
    generateCalendar(selectedDate);
    displayEvents();
};

fetchAllUserEvents();