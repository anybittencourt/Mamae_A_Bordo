document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000');

    const userList = document.getElementById('user-list');
    const chatHeader = document.getElementById('chat-header');
    const messages = document.getElementById('messages');
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const toggleButton = document.getElementById("toggle-sidebar");
    const appContainer = document.querySelector(".app-container");
    const sidebarEl = document.querySelector('.sidebar');

    const editModal = document.getElementById('edit-message-modal');
    const editModalText = document.getElementById('edit-message-text');
    const editModalSave = document.getElementById('edit-message-save');
    const editModalClose = document.getElementById('edit-message-close');
    let currentEditingMessageId = null;

    let currentUser = null;
    let selectedUser = null;
    let usersOnlineRaw = [];

    function getCurrentUserInfo() {
        const userInfoString = localStorage.getItem('Informacoes');
        if (userInfoString) {
            try {
                return JSON.parse(userInfoString);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    const userInfo = getCurrentUserInfo();
    if (userInfo) {
        currentUser = userInfo;
        socket.emit('user connected', currentUser.id_usuario);
    } else {
        alert('Você precisa estar logado para usar o chat.');
        window.location.href = '../login/login.html';
        return;
    }

    function isSidebarDisplayed() {
        if (!sidebarEl) return false;
        const style = window.getComputedStyle(sidebarEl);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    function getSelectedDisplayName() {
        const selectedLi = document.querySelector('#user-list li.selected');
        if (selectedLi) return selectedLi.textContent.trim();

        if (selectedUser != null && usersOnlineRaw && usersOnlineRaw.length) {
            for (const u of usersOnlineRaw) {
                if (typeof u === 'object') {
                    const id = u.id_usuario ?? u.usuario_id ?? u.id ?? null;
                    if (String(id) === String(selectedUser)) return u.nome || u.usuario || `Usuário ${id}`;
                } else {
                    if (String(u) === String(selectedUser)) return `Usuário ${u}`;
                }
            }
        }

        return selectedUser ? `Usuário ${selectedUser}` : null;
    }

    function updateChatHeaderBasedOnState() {
        const sidebarVisible = isSidebarDisplayed();
        const displayName = getSelectedDisplayName();

        if (!sidebarVisible) {
            if (displayName) {
                chatHeader.innerHTML = `<h2>${displayName}</h2>`;
            } else {
                chatHeader.innerHTML = `<h2>Selecione um usuário para conversar</h2>`;
            }
        } else {
            if (displayName) {
                chatHeader.innerHTML = `<h2>Conversando com ${displayName}</h2>`;
            } else {
                chatHeader.innerHTML = `<h2>Selecione um usuário para conversar</h2>`;
            }
        }
    }

    socket.on('update user list', (users) => {
        usersOnlineRaw = users;

        userList.innerHTML = '';

        const otherUsers = (Array.isArray(users) ? users : []).filter(u => {
            if (typeof u === 'object') {
                return String(u.id_usuario ?? u.usuario_id ?? u.id) !== String(currentUser.id_usuario);
            } else {
                return String(u) !== String(currentUser.id_usuario);
            }
        });

        otherUsers.forEach(user => {
            const item = document.createElement('li');

            let displayName = '';
            let idVal = null;

            if (typeof user === 'object') {
                idVal = user.id_usuario ?? user.usuario_id ?? user.id ?? null;
                displayName = user.nome || user.usuario || `Usuário ${idVal || ''}`;
            } else {
                idVal = user;
                displayName = `Usuário ${user}`;
            }

            item.textContent = displayName;
            item.dataset.userId = idVal;

            if (String(idVal) === String(selectedUser)) item.classList.add('selected');

            userList.appendChild(item);
        });

        const selectedStillOnline = otherUsers.some(u => {
            if (typeof u === 'object') {
                return String(u.id_usuario ?? u.id ?? u.usuario_id) === String(selectedUser);
            } else {
                return String(u) === String(selectedUser);
            }
        });

        if (selectedUser && !selectedStillOnline) {
            chatHeader.innerHTML = `<h2>Usuário ${selectedUser} ficou offline</h2>`;
            form.classList.add('hidden');
        }

        updateChatHeaderBasedOnState();
    });

    userList.addEventListener('click', (e) => {
        if (e.target && e.target.nodeName === 'LI') {
            const rawId = e.target.dataset.userId;
            const userId = rawId !== undefined && rawId !== null && rawId !== '' ? Number(rawId) : rawId;

            if (String(selectedUser) === String(userId)) return;

            selectedUser = userId;

            document.querySelectorAll('#user-list li').forEach(li => li.classList.remove('selected'));
            e.target.classList.add('selected');

            const displayName = e.target.textContent.trim();
            form.classList.remove('hidden');
            messages.innerHTML = 'Carregando histórico...';

            updateChatHeaderBasedOnState();

            socket.emit('get message history', { otherUserId: selectedUser }, (history) => {
                messages.innerHTML = '';
                if (!history || history.error) {
                    messages.innerHTML = '<li>Não foi possível carregar o histórico.</li>';
                    return;
                }
                history.forEach(msg => addMessageToUI(msg));
                messages.scrollTop = messages.scrollHeight;
            });
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value && selectedUser != null) {
            socket.emit('private message', {
                recipientId: selectedUser,
                text: input.value
            });
            input.value = '';
        }
    });

    socket.on('private message received', (message) => {
        const relevantToCurrentChat =
            (String(message.sender_id) === String(currentUser.id_usuario) && String(message.recipient_id) === String(selectedUser)) ||
            (String(message.sender_id) === String(selectedUser) && String(message.recipient_id) === String(currentUser.id_usuario));

        if (relevantToCurrentChat) {
            addMessageToUI(message);
            messages.scrollTop = messages.scrollHeight;
        } else {
            console.log(`Nova mensagem de ${message.sender_id}`);
        }
    });

    function addMessageToUI(msg) {
        const item = document.createElement('li');
        const messageText = msg.message ?? msg.text ?? '';
        item.innerHTML = messageText;
        
        item.dataset.messageId = msg.id; 

        if (String(msg.sender_id) === String(currentUser.id_usuario)) {
            item.classList.add('sent');

            const wrapper = document.createElement('div');
            wrapper.classList.add('sent-message-wrapper');

            wrapper.appendChild(item);

            if (!messageText.includes('fa-ban')) {
                const menu = document.createElement('div');
                menu.classList.add('message-options-menu');

                const trigger = document.createElement('i');
                trigger.className = 'fa-solid fa-ellipsis-vertical fa-rotate-90 options-trigger';
                
                const dropdown = document.createElement('div');
                dropdown.classList.add('options-dropdown');
                dropdown.innerHTML = `
                    <button class="edit-btn">Editar</button>
                    <button class="delete-btn">Excluir</button>
                `;

                menu.appendChild(trigger);
                menu.appendChild(dropdown);
                wrapper.appendChild(menu);

                trigger.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    
                    const isAlreadyOpen = dropdown.classList.contains('show');

                    document.querySelectorAll('.options-dropdown.show').forEach(d => {
                        d.classList.remove('show');
                    });

                    if (!isAlreadyOpen) {
                        dropdown.classList.add('show');
                    }
                });

                dropdown.querySelector('.edit-btn').addEventListener('click', () => {
                    openEditModal(msg.id, item.textContent); 
                    dropdown.classList.remove('show');
                });

                dropdown.querySelector('.delete-btn').addEventListener('click', () => {
                    if (confirm('Tem certeza que deseja apagar esta mensagem?')) {
                        socket.emit('delete private message', { messageId: msg.id });
                    }
                    dropdown.classList.remove('show');
                });
            }

            messages.appendChild(wrapper);

        } else {
            item.classList.add('received');
            messages.appendChild(item);
        }

        if (messageText.includes('fa-ban')) {
            item.classList.add('deleted-message');
        }
    }

    function openEditModal(messageId, currentText) {
        currentEditingMessageId = messageId;
        editModalText.value = currentText;
        editModal.classList.add('show');
    }

    function closeEditModal() {
        editModal.classList.remove('show');
        currentEditingMessageId = null;
    }

    editModalSave.addEventListener('click', () => {
        const newText = editModalText.value.trim();
        if (newText && currentEditingMessageId) {
            socket.emit('edit private message', {
                messageId: currentEditingMessageId,
                newText: newText
            });
            closeEditModal();
        }
    });

    editModalClose.addEventListener('click', closeEditModal);
    
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    socket.on('message updated', (updatedMessage) => {
        const messageLi = document.querySelector(`li[data-message-id="${updatedMessage.id}"]`);
        if (messageLi) {
            messageLi.innerHTML = updatedMessage.message; 

            if (updatedMessage.message.includes('fa-ban')) {
                messageLi.classList.add('deleted-message');
                const wrapper = messageLi.closest('.sent-message-wrapper');
                if (wrapper) {
                    const menu = wrapper.querySelector('.message-options-menu');
                    if (menu) menu.remove();
                }
            } else {
                messageLi.classList.remove('deleted-message');
            }
        }
    });

    toggleButton.addEventListener("click", () => {
        appContainer.classList.toggle("sidebar-hidden");

        requestAnimationFrame(() => {
            updateChatHeaderBasedOnState();
        });
    });

    window.addEventListener('resize', () => {
        if (sidebarEl && window.getComputedStyle(sidebarEl).display === 'none') {
            appContainer.classList.add('sidebar-hidden');
        } else {
            appContainer.classList.remove('sidebar-hidden');
        }
        updateChatHeaderBasedOnState();
    });

    if (window.MutationObserver && sidebarEl) {
        const mo = new MutationObserver(() => {
            if (window.getComputedStyle(sidebarEl).display === 'none') {
                appContainer.classList.add('sidebar-hidden');
            } else {
                appContainer.classList.remove('sidebar-hidden');
            }
            updateChatHeaderBasedOnState();
        });
        mo.observe(sidebarEl, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    if (sidebarEl && window.getComputedStyle(sidebarEl).display === 'none') {
        appContainer.classList.add('sidebar-hidden');
    }
    updateChatHeaderBasedOnState();

    window.addEventListener('click', () => {
        document.querySelectorAll('.message-options-menu .options-dropdown.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });
});