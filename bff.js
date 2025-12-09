document.addEventListener('DOMContentLoaded', function() {
    // Contador de pessoas no formulário
    let contadorPessoas = 0;
    
    // Elementos do DOM
    const formularioPessoas = document.getElementById('formulario-pessoas');
    const btnAdicionarPessoa = document.getElementById('adicionar-pessoa');
    const btnEnviarConfirmacao = document.getElementById('enviar-confirmacao');
    const btnVerificarEmail = document.getElementById('verificar-email');
    const inputEmailVerificacao = document.getElementById('telefone-verificacao');
    const statusVerificacao = document.getElementById('status-verificacao');
    const btnEnviarFoto = document.getElementById('enviar-foto');
    const inputUploadFoto = document.getElementById('upload-foto');
    
    // Adicionar a primeira pessoa
    adicionarPessoa();
    
    // Event listeners
    btnAdicionarPessoa.addEventListener('click', adicionarPessoa);
    btnEnviarConfirmacao.addEventListener('click', enviarConfirmacao);
    btnVerificarEmail.addEventListener('click', verificarPresenca);
    btnEnviarFoto.addEventListener('click', enviarFoto);
    
    // Função para adicionar um novo formulário de pessoa
    function adicionarPessoa() {
        contadorPessoas++;
        const pessoaId = `pessoa-${contadorPessoas}`;
        
        const pessoaDiv = document.createElement('div');
        pessoaDiv.className = 'pessoa-item';
        pessoaDiv.id = pessoaId;
        
        pessoaDiv.innerHTML = `
            <h3>Pessoa ${contadorPessoas}</h3>
            <button class="remover-pessoa" onclick="removerPessoa('${pessoaId}')">×</button>
            
            <div class="form-group">
                <label for="nome-${contadorPessoas}">Nome completo *</label>
                <input type="text" id="nome-${contadorPessoas}" required>
            </div>
            
            <div class="form-group">
                <label for="telefone-${contadorPessoas}">Telefone para contato *</label>
                <input type="tel" id="telefone-${contadorPessoas}" placeholder="se possível, adicionar apenas um número por familia" required>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="phone-admin-${contadorPessoas}" onchange="toggleEmail(${contadorPessoas})">
                <label for="phone-admin-${contadorPessoas}">Este é meu numero de telefone</label>
            </div>
        `;
        
        formularioPessoas.appendChild(pessoaDiv);
    }
    
    // Função para remover uma pessoa do formulário
    window.removerPessoa = function(pessoaId) {
        if (contadorPessoas > 1) {
            const pessoaElement = document.getElementById(pessoaId);
            pessoaElement.remove();
            contadorPessoas--;
            
            // Renumerar as pessoas restantes
            const pessoas = document.querySelectorAll('.pessoa-item');
            for (let i = 0; i < pessoas.length; i++) {
                const heading = pessoas[i].querySelector('h3');
                heading.textContent = `Pessoa ${i + 1}`;
            }
        } else {
            alert('É necessário ter pelo menos uma pessoa no formulário.');
        }
    }
    
    // Função para enviar a confirmação de presença
    function enviarConfirmacao() {
        // Coletar dados de todas as pessoas
        const pessoas = [];
        let formularioValido = true;
        
        for (let i = 1; i <= contadorPessoas; i++) {
            const nome = document.getElementById(`nome-${i}`).value;
            const telefone = document.getElementById(`telefone-${i}`).value;
            const phoneAdminFlag = document.getElementById(`phone-admin-${i}`).checked;
            
            // Validação básica
            if (!nome || !telefone) {
                formularioValido = false;
                break;
            }
            
            pessoas.push({
                nome: nome,
                telefone: telefone,
                isPhoneAdmin: phoneAdminFlag
            });
        }
        
        if (!formularioValido) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Simular envio dos dados (em uma aplicação real, isto enviaria para um servidor)
        console.log('Dados enviados:', pessoas);
        
        // Limpar formulário e mostrar mensagem de sucesso
        alert('Confirmação de presença enviada com sucesso! Obrigado.');
        
        // Limpar formulário
        formularioPessoas.innerHTML = '';
        contadorPessoas = 0;
        adicionarPessoa();
    }
    
    // Função para verificar confirmação por email
    function verificarPresenca() {
        const phone = inputEmailVerificacao.value.trim();
        
        if (!phone) {
            alert('Por favor, digite um telefone para verificar.');
            return;
        }
        
        // Simular verificação (em uma aplicação real, isto consultaria um servidor)
        const confirmado = Math.random() > 0.5; // Simulação aleatória
        
        statusVerificacao.style.display = 'block';
        
        if (confirmado) {
            statusVerificacao.className = 'status-confirmacao confirmado';
            statusVerificacao.innerHTML = `
                <p><strong>Presença confirmada!</strong></p>
                <p>O email ${email} está na lista de confirmados.</p>
            `;
        } else {
            statusVerificacao.className = 'status-confirmacao nao-confirmado';
            statusVerificacao.innerHTML = `
                <p><strong>Presença não confirmada.</strong></p>
                <p>O email ${email} não foi encontrado na lista de confirmados.</p>
                <p>Por favor, preencha o formulário de confirmação.</p>
            `;
        }
    }
    
    // Função para enviar foto
    function enviarFoto() {
        const file = inputUploadFoto.files[0];
        
        if (!file) {
            alert('Por favor, selecione uma foto para enviar.');
            return;
        }
        
        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Por favor, selecione uma imagem válida (JPG, PNG, GIF ou WebP).');
            return;
        }
        
        // Validar tamanho (máximo 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('A foto é muito grande. Máximo de 5MB permitido.');
            return;
        }
        
        // Criar FormData para enviar arquivo
        const formData = new FormData();
        formData.append('foto', file);
        
        // Enviar para API local
        fetch('http://localhost:3000/upload-foto', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao enviar foto: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Resposta da API:', data);
            alert('Foto enviada com sucesso! Em breve será adicionada à galeria.');
            inputUploadFoto.value = '';
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao enviar foto. Verifique se a API está rodando em http://localhost:3000');
        });
    }
});