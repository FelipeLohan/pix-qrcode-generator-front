# Integração Frontend — API de Geração de QR Code PIX

## Base URL

```
http://localhost:8080
```

---

## Endpoint

```
POST /api/pix/gerar
Content-Type: application/json
```

---

## Request

### Campos

| Campo           | Tipo     | Obrigatório | Regras                                                                 |
|-----------------|----------|-------------|------------------------------------------------------------------------|
| `chavePix`      | `string` | Sim         | CPF (11 dígitos), CNPJ (14 dígitos), e-mail, telefone (`+55...`) ou EVP (UUID) |
| `nomeRecebedor` | `string` | Sim         | Não vazio. Acentos e caracteres especiais são removidos automaticamente pelo backend. |
| `cidade`        | `string` | Sim         | Não vazio. Mesma regra de sanitização do nome.                         |

### Formatos aceitos para `chavePix`

| Tipo     | Formato                              | Exemplo                                |
|----------|--------------------------------------|----------------------------------------|
| CPF      | 11 dígitos numéricos                 | `"12345678901"`                        |
| CNPJ     | 14 dígitos numéricos                 | `"12345678000195"`                     |
| E-mail   | Formato `x@y.z`                      | `"usuario@email.com"`                  |
| Telefone | `+55` seguido de 10 ou 11 dígitos    | `"+5511999998888"`                     |
| EVP      | UUID padrão (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) | `"123e4567-e89b-12d3-a456-426614174000"` |

### Exemplo de body

```json
{
  "chavePix": "exemplo@email.com",
  "nomeRecebedor": "Felipe Oliveira",
  "cidade": "Sao Paulo"
}
```

---

## Responses

### 200 OK — QR Code gerado com sucesso

```json
{
  "qrCodeBase64": "iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAIAAAAP3aGb..."
}
```

| Campo          | Tipo     | Descrição                                                              |
|----------------|----------|------------------------------------------------------------------------|
| `qrCodeBase64` | `string` | Imagem PNG do QR Code codificada em Base64 **sem** o prefixo `data:image/png;base64,` |

Para exibir a imagem no HTML, adicione o prefixo manualmente:

```js
const src = `data:image/png;base64,${response.qrCodeBase64}`;
// <img src={src} />
```

---

### 400 Bad Request — Dados inválidos

Ocorre quando:
- A chave PIX não corresponde a nenhum formato válido
- Um ou mais campos estão vazios ou ausentes
- O body da requisição está ausente ou malformado

```json
{
  "message": "Chave PIX inválida."
}
```

```json
{
  "message": "chavePix: must not be blank"
}
```

```json
{
  "message": "Corpo da requisição ausente ou inválido."
}
```

---

### 422 Unprocessable Entity — Erro de negócio

Ocorre quando o BR Code gerado excede 512 caracteres (limite do padrão BACEN). Situação rara na prática.

```json
{
  "message": "BR Code excede o limite de 512 caracteres."
}
```

---

### 500 Internal Server Error — Erro inesperado

```json
{
  "message": "Erro interno ao gerar QR Code."
}
```

---

## Exemplo de integração em JavaScript

```js
async function gerarQrCodePix({ chavePix, nomeRecebedor, cidade }) {
  const response = await fetch('http://localhost:8080/api/pix/gerar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chavePix, nomeRecebedor, cidade }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return `data:image/png;base64,${data.qrCodeBase64}`;
}
```

---

## Resumo do fluxo

```
Frontend                               Backend
   |                                      |
   |-- POST /api/pix/gerar -------------> |
   |   { chavePix, nomeRecebedor, cidade }|
   |                                      |-- valida chave PIX
   |                                      |-- sanitiza nome e cidade
   |                                      |-- monta BR Code (padrão BACEN)
   |                                      |-- calcula CRC16-CCITT
   |                                      |-- gera imagem PNG 400x400
   |                                      |-- codifica em Base64
   |                                      |
   |<-- 200 OK { qrCodeBase64: "..." } -- |
   |                                      |
   |   exibe <img src="data:image/png;    |
   |         base64,{qrCodeBase64}" />    |
```
