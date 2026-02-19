document.addEventListener('DOMContentLoaded', function() {
    // Configurações da API
    const API_BASE = 'https://presence-hub-prod-6ebefc6781bc.herokuapp.com/v1';
    // Token removido, pois as rotas são públicas

    // Contador de pessoas no formulário
    let contadorPessoas = 0;
    
    // Elementos do DOM
    const formularioPessoas = document.getElementById('formulario-pessoas');
    const btnAdicionarPessoa = document.getElementById('adicionar-pessoa');
    const btnEnviarConfirmacao = document.getElementById('enviar-confirmacao');
    const btnVerificarEmail = document.getElementById('verificar-email');
    const inputTelefoneVerificacao = document.getElementById('telefone-verificacao');
    const statusVerificacao = document.getElementById('status-verificacao');
    const presencasLista = document.getElementById('presencas-lista');
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
            <button class="remover-pessoa" onclick="removerPessoa('${pessoaId}')">×</button>
            
            <div class="form-group">
                <label for="nome-${contadorPessoas}">Nome completo *</label>
                <input type="text" id="nome-${contadorPessoas}" required>
            </div>
            
            <div class="form-group">
                <label for="telefone-${contadorPessoas}">Telefone para contato *</label>
                <label class="small-label">Exemplo: 41995241542 (sem espaços ou parênteses).</label>
                <input type="tel" id="telefone-${contadorPessoas}" placeholder="Coloque apenas um numero de telefone por família" required>
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
        } else {
            alert('É necessário ter pelo menos uma pessoa no formulário.');
        }
    }
    
    // Função para enviar a confirmação de presença
    async function enviarConfirmacao() {
        // Coletar dados de todas as pessoas
        const pessoas = [];
        let formularioValido = true;
        
        for (let i = 1; i <= contadorPessoas; i++) {
            const nome = document.getElementById(`nome-${i}`).value.trim();
            const telefone = document.getElementById(`telefone-${i}`).value.trim().replace(/\D/g, ''); // Remove não-dígitos
            
            // Validação básica
            if (!nome || telefone.length < 10 || telefone.length > 11) {
                formularioValido = false;
                break;
            }
            
            pessoas.push({
                name: nome,
                phone: parseInt(telefone) // Converte para número como na API
            });
        }
        
        if (!formularioValido) {
            alert('Por favor, preencha todos os campos obrigatórios. Telefone deve ter 10-11 dígitos.');
            return;
        }
        
        // Desabilitar botão durante envio
        btnEnviarConfirmacao.disabled = true;
        btnEnviarConfirmacao.textContent = 'Enviando...';
        
        try {
            // Enviar checkin para cada pessoa
            const promises = pessoas.map(pessoa => 
                fetch(`${API_BASE}/presence/checkin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pessoa)
                })
            );
            
            const responses = await Promise.all(promises);
            const results = await Promise.all(responses.map(res => res.json()));
            
            // Verificar se todos foram bem-sucedidos
            const erros = results.filter(result => result.error);
            if (erros.length > 0) {
                throw new Error(`Erro na API: ${erros.map(e => e.error).join(', ')}`);
            }
            
            alert('Confirmação de presença enviada com sucesso! Obrigado.');
            
            // Limpar formulário
            formularioPessoas.innerHTML = '';
            contadorPessoas = 0;
            adicionarPessoa();
        } catch (error) {
            console.error('Erro ao enviar confirmação:', error);
            alert('Erro ao enviar confirmação. Tente novamente.');
        } finally {
            // Reabilitar botão
            btnEnviarConfirmacao.disabled = false;
            btnEnviarConfirmacao.textContent = 'Enviar Confirmação';
        }
    }
    
    // Função para verificar presença por telefone
    async function verificarPresenca() {
        const phone = inputTelefoneVerificacao.value.trim().replace(/\D/g, '');
        
        if (phone.length < 10 || phone.length > 11) {
            alert('Por favor, digite um telefone válido (10-11 dígitos).');
            return;
        }
        
        // Desabilitar botão durante verificação
        btnVerificarEmail.disabled = true;
        btnVerificarEmail.textContent = 'Verificando...';
        
        try {
            const response = await fetch(`${API_BASE}/presence/${phone}/group`);
            const data = await response.json();
            
            statusVerificacao.style.display = 'none';
            presencasLista.innerHTML = ''; // Limpar lista anterior
            
            if (response.ok && data && data.presence && data.presence.length > 0) {
                // Renderizar cards para cada presença
                data.presence.forEach(presenca => {
                    const card = document.createElement('div');
                    card.className = 'presenca-card';
                    card.innerHTML = `
                        <div class="presenca-info">
                            <strong>${presenca.name}</strong><br>
                            Telefone: ${presenca.phone}<br>
                            Confirmado em: ${new Date(presenca.createdAt).toLocaleString('pt-BR')}
                        </div>
                        <button class="btn-cancelar" onclick="cancelarPresenca('${presenca.name}', '${presenca._id}')">Cancelar Confirmação</button>
                    `;
                    presencasLista.appendChild(card);
                });
            } else {
                statusVerificacao.className = 'status-confirmacao nao-confirmado';
                statusVerificacao.innerHTML = `
                    <p><strong>Presença não confirmada.</strong></p>
                    <p>O telefone ${phone} não foi encontrado na lista de confirmados.</p>
                    <p>Por favor, preencha o formulário de confirmação.</p>
                `;
                statusVerificacao.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao verificar presença:', error);
            alert('Erro ao verificar presença. Tente novamente.');
        } finally {
            // Reabilitar botão
            btnVerificarEmail.disabled = false;
            btnVerificarEmail.textContent = 'Verificar';
        }
    }
    
    // Função para cancelar presença
    window.cancelarPresenca = async function(name, id) {
        try {
            const response = await fetch(`${API_BASE}/presence/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao cancelar presença');
            }
            
            alert(`Confirmação de ${name} cancelada com sucesso.`);
            
            // Remover o card da lista
            const card = document.querySelector(`[onclick="cancelarPresenca('${name}', '${id}')"]`).parentElement;
            card.remove();
            
            // Se não houver mais cards, mostrar mensagem de não confirmado
            if (presencasLista.children.length === 0) {
                statusVerificacao.className = 'status-confirmacao nao-confirmado';
                statusVerificacao.innerHTML = `
                    <p><strong>Presença não confirmada.</strong></p>
                    <p>Nenhuma confirmação encontrada para este telefone.</p>
                `;
                statusVerificacao.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao cancelar presença:', error);
            alert('Erro ao cancelar presença. Tente novamente.');
        }
    }
    
    // Função para enviar foto
    async function enviarFoto() {
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
        
        // Desabilitar botão durante envio
        btnEnviarFoto.disabled = true;
        btnEnviarFoto.textContent = 'Enviando...';
        
        try {
            // Criar FormData
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`${API_BASE}/assets`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao enviar foto');
            }
            
            const data = await response.json();
            console.log('Resposta da API:', data);
            alert('Foto enviada com sucesso! Em breve será adicionada à galeria.');
            inputUploadFoto.value = '';
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar foto. Verifique se a API está rodando.');
        } finally {
            // Reabilitar botão
            btnEnviarFoto.disabled = false;
            btnEnviarFoto.textContent = 'Enviar Foto';
        }
    }
});