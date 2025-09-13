// Chave de criptografia DES
// ATENÇÃO: Esta chave deve ser mantida em segredo absoluto
// Chave deve ter exatamente 8 bytes (64 bits) para DES

const ENCRYPTION_CONFIG = {
    // Chave DES (8 bytes / 64 bits)
    key: "AUDICOM", // 8 caracteres = 8 bytes
    
    // Configurações adicionais
    algorithm: "DES",
    mode: "ECB", // Modo de operação
    padding: "PKCS7", // Tipo de padding
    
    // Função para obter a chave formatada
    getKey() {
        // Garantir que a chave tenha exatamente 8 bytes
        let formattedKey = this.key.padEnd(8, '0').substring(0, 8);
        return formattedKey;
    },
    
    // Função para validar a chave
    validateKey() {
        const key = this.getKey();
        if (key.length !== 8) {
            throw new Error("Chave DES deve ter exatamente 8 bytes");
        }
        return true;
    }
};

// Não exportar a chave diretamente para maior segurança
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENCRYPTION_CONFIG;
}