# Documentação Backend — Geração de QR Code PIX Estático (Valor Dinâmico)

> **Referência normativa:** Manual de Padrões para Iniciação do PIX — BR Code
> Banco Central do Brasil | Versão 2.4 (Resolução BCB nº 1, de 12 ago. 2020)

---

## 1. Contrato de Entrada (Payload recebido do frontend)

```json
POST /api/pix/gerar
Content-Type: application/json

{
  "chavePix":      "exemplo@email.com",
  "nomeRecebedor": "Felipe Oliveira",
  "cidade":        "Sao Paulo"
}
```

| Campo           | Tipo     | Obrigatório | Regras                                           |
|-----------------|----------|-------------|--------------------------------------------------|
| `chavePix`      | `string` | Sim         | CPF (11 dígitos), CNPJ (14), e-mail, telefone (`+55...`) ou EVP (UUID) |
| `nomeRecebedor` | `string` | Sim         | Máx. **25 caracteres**. Remover acentos e caracteres especiais antes de usar no BR Code. |
| `cidade`        | `string` | Sim         | Máx. **15 caracteres**. Mesma regra de sanitização. |

---

## 2. Contrato de Saída (Resposta ao frontend)

```json
HTTP 200 OK
Content-Type: application/json

{
  "qrCodeBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

O campo `qrCodeBase64` é a imagem **PNG do QR Code**, codificada em Base64, **sem** o prefixo `data:image/png;base64,` (o frontend adiciona esse prefixo).

---

## 3. O que é o BR Code

O BR Code é a string de texto que codifica todas as informações de um pagamento PIX no padrão **EMVCo MPQR** adaptado pelo BACEN. Esta string é transformada em imagem QR Code.

Estrutura geral de cada campo:

```
[ID: 2 dígitos][COMPRIMENTO: 2 dígitos, zero-padded][VALOR: N caracteres]
```

---

## 4. Estrutura completa do BR Code — QR Code Estático sem valor fixo

> ⚠️ A **ausência do campo 54** (valor) é o que define que o pagador escolhe o valor ao escanear.

### Tabela de campos obrigatórios

| ID  | Nome                          | Valor fixo / derivado                        | Exemplo gerado           |
|-----|-------------------------------|----------------------------------------------|--------------------------|
| 00  | Payload Format Indicator      | `"01"` (fixo)                                | `000201`                 |
| 01  | Point of Initiation Method    | `"11"` = estático reutilizável (fixo)        | `010211`                 |
| 26  | Merchant Account Information  | Sub-campos abaixo                            | `2633...`                |
| ↳ 00 | GUI (identificador PIX)      | `"BR.GOV.BCB.PIX"` (fixo, 14 chars)         | `0014BR.GOV.BCB.PIX`     |
| ↳ 01 | Chave PIX                    | Valor do campo `chavePix`                    | `0115exemplo@email.com`  |
| 52  | Merchant Category Code        | `"0000"` (fixo)                              | `52040000`               |
| 53  | Transaction Currency          | `"986"` = Real brasileiro (fixo)             | `5303986`                |
| 54  | Transaction Amount            | ❌ **NÃO incluir** (valor dinâmico)           | —                        |
| 58  | Country Code                  | `"BR"` (fixo)                                | `5802BR`                 |
| 59  | Merchant Name                 | `nomeRecebedor` sanitizado, máx 25           | `5915FELIPE OLIVEIRA`    |
| 60  | Merchant City                 | `cidade` sanitizada, máx 15                  | `6009SAO PAULO`          |
| 62  | Additional Data Field         | Sub-campo 05 obrigatório                     | `62070503***`            |
| ↳ 05 | Reference Label (txId)       | `"***"` para QR estático (fixo, 3 chars)    | `0503***`                |
| 63  | CRC16                         | Calculado sobre toda a string (4 hex)        | `63041D3D`               |

---

## 5. Algoritmo de montagem passo a passo

### 5.1 Sanitização dos campos de texto

Antes de montar o BR Code, sanitize `nomeRecebedor` e `cidade`:

```
1. Converter para maiúsculas
2. Remover acentos (NFD → remover diacríticos)
3. Substituir caracteres fora de [A-Z0-9 ] por espaço
4. Remover espaços duplos e trim
5. Truncar: nomeRecebedor → 25 chars / cidade → 15 chars
```

Exemplos:
- `"Felipe Gonçalves"` → `"FELIPE GONCALVES"`
- `"São Paulo"` → `"SAO PAULO"`

### 5.2 Montagem do campo 26 (Merchant Account Information)

```
sub00 = "0014BR.GOV.BCB.PIX"
sub01 = "01" + zeroPad(len(chavePix), 2) + chavePix

conteudo26 = sub00 + sub01
campo26 = "26" + zeroPad(len(conteudo26), 2) + conteudo26
```

**Exemplo** com `chavePix = "exemplo@email.com"` (17 chars):
```
sub00   = "0014BR.GOV.BCB.PIX"          → 18 chars
sub01   = "0117exemplo@email.com"        → 21 chars
conteudo = 39 chars
campo26 = "2639" + "0014BR.GOV.BCB.PIX0117exemplo@email.com"
```

### 5.3 Montagem do campo 59 e 60

```
campo59 = "59" + zeroPad(len(nomeRecebedor), 2) + nomeRecebedor
campo60 = "60" + zeroPad(len(cidade), 2) + cidade
```

### 5.4 Montagem do campo 62 (Additional Data)

```
sub05    = "0503***"          → txId fixo para QR estático
campo62  = "6207" + sub05     → "62070503***"
```

### 5.5 String pré-CRC

Concatenar todos os campos **sem campo 54**:

```
payload = "000201"
        + "010211"
        + campo26
        + "52040000"
        + "5303986"
        + "5802BR"
        + campo59
        + campo60
        + "62070503***"
        + "6304"          ← prefixo do CRC, sem o valor ainda
```

### 5.6 Cálculo do CRC16

O BACEN exige **CRC16-CCITT** com os parâmetros:

| Parâmetro    | Valor        |
|--------------|--------------|
| Polinômio    | `0x1021`     |
| Valor inicial | `0xFFFF`    |
| Input reflect | `false`     |
| Output reflect | `false`    |
| XOR final    | `0x0000`     |

```
crc = crc16_ccitt(payload)   // calcula sobre toda a string incluindo "6304"
campo63 = "6304" + upperHex(crc, 4)  // ex: "63041D3D"
brCode = payload + upperHex(crc, 4)
```

---

## 6. Exemplo completo

**Entrada:**
```json
{
  "chavePix":      "exemplo@email.com",
  "nomeRecebedor": "Felipe Oliveira",
  "cidade":        "Sao Paulo"
}
```

**Campos sanitizados:**
- nomeRecebedor → `"FELIPE OLIVEIRA"` (15 chars)
- cidade → `"SAO PAULO"` (9 chars)

**BR Code gerado:**
```
000201
010211
263900 14BR.GOV.BCB.PIX 0117exemplo@email.com
52040000
5303986
5802BR
5915FELIPE OLIVEIRA
6009SAO PAULO
62070503***
6304????
```

_(formatado por linha para legibilidade — na prática é uma string contínua)_

String pré-CRC contínua:
```
00020101021126390014BR.GOV.BCB.PIX0117exemplo@email.com5204000053039865802BR5915FELIPE OLIVEIRA6009SAO PAULO62070503***6304
```

Após calcular o CRC16 → resultado: `1D3D` (exemplo)

**BR Code final:**
```
00020101021126390014BR.GOV.BCB.PIX0117exemplo@email.com5204000053039865802BR5915FELIPE OLIVEIRA6009SAO PAULO62070503***63041D3D
```

---

## 7. Geração da imagem PNG (Base64)

Com o BR Code pronto, gerar a imagem QR Code:

```
1. Usar biblioteca QR Code (ex: ZXing, QRGen, qrcode-generator)
2. Parâmetros recomendados:
   - Nível de correção de erros: M (15%)
   - Tamanho: mínimo 200x200px (recomendado 400x400px para leitura)
   - Margem (quiet zone): mínimo 4 módulos
3. Codificar a imagem PNG em Base64 (sem prefixo data URI)
4. Retornar no campo qrCodeBase64
```

**Exemplo Java (Spring Boot com ZXing):**
```java
@PostMapping("/gerar")
public PixResponse gerarQrCode(@RequestBody PixRequest request) {
    String brCode = pixBrCodeService.montar(
        request.getChavePix(),
        request.getNomeRecebedor(),
        request.getCidade()
    );

    BitMatrix matrix = new QRCodeWriter().encode(
        brCode, BarcodeFormat.QR_CODE, 400, 400
    );

    BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ImageIO.write(image, "PNG", baos);

    String base64 = Base64.getEncoder().encodeToString(baos.toByteArray());
    return new PixResponse(base64);
}
```

---

## 8. Validações que o backend deve aplicar

| Campo           | Validação                                                                 |
|-----------------|---------------------------------------------------------------------------|
| `chavePix`      | Não nulo/vazio. Formato válido de acordo com o tipo inferido (ver abaixo) |
| `nomeRecebedor` | Não nulo/vazio. Máx 25 chars após sanitização.                           |
| `cidade`        | Não nulo/vazio. Máx 15 chars após sanitização.                           |
| BR Code gerado  | Comprimento máximo: 512 caracteres (limite do padrão EMVCo)               |

**Inferência do tipo de chave (opcional, para validação extra):**

```
11 dígitos numéricos → CPF
14 dígitos numéricos → CNPJ
Contém @ → E-mail
Começa com +55 → Telefone
Padrão UUID (8-4-4-4-12 hex) → EVP (chave aleatória)
```

---

## 9. Respostas de erro esperadas pelo frontend

```json
// 400 Bad Request
{
  "message": "Chave PIX inválida."
}

// 422 Unprocessable Entity
{
  "message": "Nome do recebedor excede 25 caracteres."
}

// 500 Internal Server Error
{
  "message": "Erro interno ao gerar QR Code."
}
```

O campo `message` é exibido diretamente na UI para o usuário.

---

## 10. Checklist de conformidade BACEN

- [ ] Campo 00 presente com valor `"01"`
- [ ] Campo 01 com valor `"11"` (estático reutilizável)
- [ ] Campo 26 contém sub-campo 00 = `"BR.GOV.BCB.PIX"` e sub-campo 01 = chave PIX
- [ ] Campo 52 presente com valor `"0000"`
- [ ] Campo 53 presente com valor `"986"`
- [ ] Campo 54 **ausente** (QR de valor dinâmico)
- [ ] Campo 58 presente com valor `"BR"`
- [ ] Campo 59 com nome sanitizado, máx 25 chars
- [ ] Campo 60 com cidade sanitizada, máx 15 chars
- [ ] Campo 62 presente com sub-campo 05 = `"***"`
- [ ] Campo 63 com CRC16-CCITT correto (4 hex maiúsculos)
- [ ] String total ≤ 512 caracteres
- [ ] QR Code com margem mínima de 4 módulos (quiet zone)
- [ ] Imagem PNG retornada em Base64 puro (sem prefixo `data:image/png;base64,`)
