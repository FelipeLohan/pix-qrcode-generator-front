# Task 02: Modelagem e Serviço de API
- [x] Criar o modelo `PixRequest` com os campos: `chavePix`, `tipoChave`, `valor`, `nomeRecebedor`, `cidade`, `txId`.
- [x] Criar o enum ou type `TipoChave` (CPF, CNPJ, EMAIL, TELEFONE, EVP).
- [x] Implementar o `PixService` utilizando `HttpClient` e `inject()`.
- [x] Garantir que o método `gerarQrCode` retorne um `Observable<PixResponse>`.
