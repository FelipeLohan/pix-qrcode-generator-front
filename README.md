# PIX QR Code Generator

Gerador de QR Code PIX estático (valor livre) — o pagador escolhe o valor na hora do pagamento.

🔗 **[qrcodegenerator.felipelohan.com](https://qrcodegenerator.felipelohan.com/)**

---

## Sobre o projeto

Aplicação web que gera um QR Code PIX a partir de uma chave PIX, nome do recebedor e cidade. O QR Code segue o padrão **BR Code estático** definido pelo BACEN (EMVCo MPQR), permitindo que qualquer pagador escaneie e escolha o valor livremente.

O frontend se comunica com uma API Spring Boot que monta o payload BR Code e retorna a imagem do QR Code em Base64.

---

## Funcionalidades

- Suporte a todos os tipos de chave PIX: **CPF, CNPJ, E-mail, Telefone e Chave Aleatória (EVP)**
- Máscaras de input em tempo real para CPF, CNPJ, Telefone e UUID
- Download do QR Code gerado em PNG
- Deploy containerizado com Docker + Nginx reverse proxy
- Interface responsiva

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Angular 21 (Standalone Components + Signals) |
| Estilização | Tailwind CSS v4 com design tokens via `@theme` |
| Forms | Angular Reactive Forms |
| HTTP | `HttpClient` com `provideHttpClient(withFetch())` |
| Ícones | Lucide Angular |
| Container | Docker multi-stage (Node 22 builder + Nginx Alpine) |
| Deploy | Coolify |

---

## Como executar localmente

### Pré-requisitos
- Node.js 22+
- API backend rodando em `http://localhost:8080`

### Instalação

```bash
npm install
npm start
```

Acesse `http://localhost:4200`. As requisições `/api/*` são redirecionadas ao backend via proxy (`proxy.conf.json`).

### Build de produção

```bash
npm run build
```

---

## Docker

```bash
docker build -t pix-qrcode-generator-front .
docker run -p 3001:3001 -e BACKEND_URL=https://sua-api.com pix-qrcode-generator-front
```

A variável `BACKEND_URL` define o endereço da API de backend. O Nginx atua como reverse proxy para `/api/*`.

---

## Payload enviado ao backend

```json
{
  "tipoChave": "CPF",
  "chavePix": "00000000000",
  "nomeRecebedor": "João Silva",
  "cidade": "Recife"
}
```

> Para `TELEFONE`, o frontend envia apenas DDD + número (ex: `81900000000`). O backend é responsável por prefixar `+55`.

---

## Backend

O backend correspondente (Spring Boot) está disponível em:
[github.com/FelipeLohan/pix-qrcode-generator-api](https://github.com/FelipeLohan/pix-qrcode-generator-api)

---

## Autor

Desenvolvido por **Felipe Lohan**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Felipe%20Lohan-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/felipe-lohan-767294213/)
[![GitHub](https://img.shields.io/badge/GitHub-FelipeLohan-181717?style=flat&logo=github)](https://github.com/FelipeLohan/pix-qrcode-generator-front)
