/** Tipos de chave PIX — usado apenas para validação no frontend. */
export type TipoChave = 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'EVP';

/** Payload enviado ao backend para gerar o QR Code estático. */
export interface PixRequest {
  tipoChave: TipoChave;
  chavePix: string;
  nomeRecebedor: string;
  cidade: string;
}

/** Resposta do backend com a imagem do QR Code em Base64. */
export interface PixResponse {
  qrCodeBase64: string;
}
