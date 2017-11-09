"use strict";
const expect = require('chai').expect;
const helpers = require('broccoli-test-helper');
const fs = require('fs');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;
const Wat2Wasm = require("../index").Wat2Wasm;

describe("Wat2Wasm", function() {
  let input;
  let output;
  let subject;

  beforeEach(async () => {
    input = await createTempDir();
    subject = new Wat2Wasm(input.path());
    output = createBuilder(subject);
  });

  it('should compile wasm', async () => {
    input.write({
      "add.wat": `(module
  (type $iii (func (param i32 i32) (result i32)))
  (func $add (export "add") (type $iii) (param $x i32) (param $y i32) (result i32)
    get_local $x
    get_local $y
    i32.add))`
    });

    await output.build();

    expect(
      output.changes()
    ).to.deep.equal({
      'add.wasm': 'create'
    });

    const buffer = fs.readFileSync(output.path('add.wasm'));
    // console.log(buffer);
    const wasmModule = new WebAssembly.Module(buffer);
    const wasmInstance = new WebAssembly.Instance(wasmModule);
    expect(
      wasmInstance.exports.add(2, 3)
    ).to.equal(5);
  });

  afterEach(async () => {
    await input.dispose();
    await output.dispose();
  });
});
