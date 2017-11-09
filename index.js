const Filter = require('broccoli-filter');

const wabt = require('./vendor/libwabt.js');

class Wat2Wasm extends Filter {
  constructor(input, options = {}) {
    super(input, {
      annotation: options.annotation,
    });
    this.extensions = ['wat', 'wast'];
    this.targetExtension = 'wasm';
    this.inputEncoding = 'utf8';
    this.outputEncoding = null;
  }

  /**
   * Parse wat and output wasm.
   * @param {string} wat
   * @param {string} relativePath
   * @returns {Uint8Array} the wasm module bytes
   */
  processString(wat, relativePath) {
    return wabt.ready.then(() => {
      const mod = wabt.parseWat(relativePath, wat);
      try {
        mod.resolveNames();
        mod.validate();
        const result = mod.toBinary({log: false});
        return result.buffer;
      } finally {
        mod.destroy();
      }
    });
  }
}

module.exports.Wat2Wasm = Wat2Wasm;
