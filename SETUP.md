# Fifteenth Birthday - Guia de Configuração

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn

## 🚀 Como Começar

### 1. Instalar Dependências da API

```bash
cd api
npm install
```

### 2. Rodar a API Localmente

```bash
cd api
npm run start:dev
```

A API estará rodando em **http://localhost:3000**

### 3. Servir o Frontend

Você pode servir o `index.html` usando qualquer servidor estático. Exemplos:

**Opção 1: Usando Python (se tiver instalado)**
```bash
cd ..
python -m http.server 8000
```

**Opção 2: Usando Node.js + http-server**
```bash
npm install -g http-server
http-server -p 8000
```

**Opção 3: Usando VS Code Live Server**
- Instale a extensão "Live Server" no VS Code
- Clique direito no `index.html` → "Open with Live Server"

### 4. Acessar o Site

Abra seu navegador em **http://localhost:8000** (ou a porta que você configurou)

## 📸 Funcionalidade de Upload de Fotos

O site agora envia fotos diretamente para a API local:

1. Na seção "Galeria de Fotos", selecione uma imagem
2. Clique em "Enviar Foto"
3. A foto será enviada para `http://localhost:3000/upload-foto`
4. As fotos serão armazenadas em `api/uploads/`

### Requisitos de Arquivo

- **Formatos aceitos**: JPG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB

## 🗂️ Estrutura do Projeto

```
fifteenth-birthday/
├── index.html          # Frontend principal
├── styles.css          # Estilos
├── bff.js              # JavaScript frontend
├── api/                # Backend NestJS
│   ├── src/
│   │   ├── app.controller.ts    
│   │   ├── app.module.ts        
│   │   ├── app.service.ts
│   │   └── main.ts             
│   ├── uploads/
|   |   ...        
│   ├── package.json
│   └── tsconfig.json
└── README.md           # Este arquivo
```

## 🔧 Variáveis de Ambiente (Opcional)

Você pode criar um arquivo `.env` na raiz do projeto `api/` para configurar:

```
PORT=3000
NODE_ENV=development
```

## 🐛 Troubleshooting

### "Erro ao enviar foto. Verifique se a API está rodando"

- Certifique-se de que rodou `npm run start:dev` na pasta `api`
- Verifique se a API está em `http://localhost:3000`
- Abra as Developer Tools (F12) → Console para ver erros detalhados

### CORS Error

Se receber erro de CORS, a API pode precisar de configuração adicional. Abra `api/main.ts` e verifique a configuração de CORS.

## 📝 Próximos Passos

- Integrar banco de dados para persistir dados de confirmação
- Criar endpoint para listar fotos
- Implementar autenticação para administradores
- Configurar deploy (Vercel, Heroku, etc.)

