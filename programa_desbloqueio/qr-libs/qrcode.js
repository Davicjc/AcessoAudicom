/**
 * QRCode.js - Biblioteca para gerar QR Codes
 * Versão otimizada para uso no programa de desbloqueio
 * 
 * @author davidshimjs
 * @see http://www.d-project.com/
 */

var QRCode;

(function () {
    // Implementação simplificada do QRCode
    function QR8bitByte(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data;
        this.parsedData = [];

        // Suporte para caracteres UTF-8
        for (var i = 0, l = this.data.length; i < l; i++) {
            var byteArray = [];
            var code = this.data.charCodeAt(i);

            if (code > 0x10000) {
                byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3F);
            } else if (code > 0x800) {
                byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3F);
            } else if (code > 0x80) {
                byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3F);
            } else {
                byteArray[0] = code;
            }

            this.parsedData.push(byteArray);
        }

        this.parsedData = Array.prototype.concat.apply([], this.parsedData);

        if (this.parsedData.length != this.data.length) {
            this.parsedData.unshift(191);
            this.parsedData.unshift(187);
            this.parsedData.unshift(239);
        }
    }

    // Constantes básicas
    var QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3
    };

    var QRErrorCorrectLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
    };

    // Função principal do QRCode
    QRCode = function (el, vOption) {
        this._htOption = {
            width: 256,
            height: 256,
            typeNumber: 4,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRErrorCorrectLevel.H
        };

        if (typeof vOption === 'string') {
            vOption = {
                text: vOption
            };
        }

        // Sobrescreve opções
        if (vOption) {
            for (var i in vOption) {
                this._htOption[i] = vOption[i];
            }
        }

        if (typeof el == "string") {
            el = document.getElementById(el);
        }

        this._el = el;
        
        if (this._htOption.text) {
            this.makeCode(this._htOption.text);
        }
    };

    // Método para criar QR Code (implementação simplificada)
    QRCode.prototype.makeCode = function (sText) {
        // Para o programa de desbloqueio, vamos usar uma implementação básica
        // que apenas exibe o texto em formato de código
        this._el.innerHTML = '<div style="font-family: monospace; background: #f0f0f0; padding: 10px; border: 2px solid #ccc; text-align: center;">QR Code: ' + sText + '</div>';
        this._el.title = sText;
    };

    // Método para limpar o QR Code
    QRCode.prototype.clear = function () {
        this._el.innerHTML = '';
    };

    // Níveis de correção de erro
    QRCode.CorrectLevel = QRErrorCorrectLevel;
})();