import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Run the pure layout module on the project's Node 20 runtime without another test dependency.
const source = readFileSync(new URL('../src/lib/keyboard-variants.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { buildVariantLayout, SWITCH_PITCH, KEYCAP_GAP } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const gltf = JSON.parse(readFileSync(new URL('../public/keyboard.gltf', import.meta.url), 'utf8'));
const sourceNames = new Set(gltf.nodes.map((node) => node.name));

for (const [variant, count] of [['60', 61], ['TKL', 87], ['FULL', 104]]) {
  test(`${variant}: complete ANSI footprint with no overlapping keys`, () => {
    const { keys, width, height, clusters } = buildVariantLayout(variant);
    assert.equal(keys.length, count);
    assert.equal(new Set(keys.map((key) => key.id)).size, count);
    for (const key of keys) {
      assert.ok(sourceNames.has(key.source), `Missing glTF source ${key.source}`);
      assert.ok(key.x >= 0 && key.x + key.units <= width && key.y >= 0 && key.y + key.heightUnits <= height);
      assert.ok(clusters.some((c) => key.x >= c.x && key.x + key.units <= c.x + c.width && key.y >= c.y && key.y + key.heightUnits <= c.y + c.height), `Key outside case opening: ${key.id}`);
      for (const other of keys) {
        if (key === other) continue;
        assert.ok(key.x + key.units <= other.x || other.x + other.units <= key.x || key.y + key.heightUnits <= other.y || other.y + other.heightUnits <= key.y, `Overlap: ${key.id}/${other.id}`);
      }
    }
    assert.equal(keys.find((key) => key.id === 'space').units, 6.25);
    assert.equal(keys.find((key) => key.id === 'rshift').units, 2.75);
    assert.equal(SWITCH_PITCH, 0.01905);
    assert.ok(KEYCAP_GAP > 0 && KEYCAP_GAP < 0.001);
  });
}

test('60% omits function/navigation clusters; TKL has grouped functions and inverted-T arrows', () => {
  const compact = buildVariantLayout('60').keys;
  assert.ok(!compact.some((key) => /^(f\d+|arrow|insert|home|page|del|end)/.test(key.id)));
  const tkl = buildVariantLayout('TKL').keys;
  const key = (id) => tkl.find((entry) => entry.id === id);
  assert.equal(key('f1').x - key('esc').x, 2);
  assert.equal(key('f5').x - key('f4').x, 1.5);
  assert.equal(key('f9').x - key('f8').x, 1.5);
  assert.equal(key('arrowup').x, key('arrowdown').x);
  assert.equal(key('arrowup').y + 1, key('arrowdown').y);
  assert.equal(key('arrowleft').x + 1, key('arrowdown').x);
  assert.equal(key('arrowright').x - 1, key('arrowdown').x);
  for (const id of ['printscreen', 'scrolllock', 'pause', 'insert', 'home', 'pageup', 'del', 'end', 'pagedown']) assert.ok(key(id));
});


test('Full-Size retains the entire TKL footprint and adds a standard, consistently colored numpad', () => {
  const full = buildVariantLayout('FULL');
  const tkl = buildVariantLayout('TKL');
  assert.deepEqual(full.keys.slice(0, 87), tkl.keys);
  assert.equal(full.width, 23);
  const numpad = full.keys.filter((key) => key.id.startsWith('num'));
  assert.equal(numpad.length, 17);
  const key = (id) => numpad.find((entry) => entry.id === id);
  assert.equal(key('num0').units, 2);
  for (const id of ['numadd', 'numenter']) {
    assert.equal(key(id).heightUnits, 2);
    assert.equal(key(id).units, 1);
  }
  assert.equal(key('numadd').y + 2, key('numenter').y);
  assert.equal(key('numenter').y + 2, key('num0').y + 1);
  assert.equal(key('numlock').x - (tkl.width), 0.5);
  for (const id of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'decimal']) assert.equal(key(`num${id}`).colorRole, 'base');
  for (const id of ['lock', 'divide', 'multiply', 'subtract', 'add']) assert.equal(key(`num${id}`).colorRole, 'modifier');
  assert.equal(key('numenter').colorRole, 'accent');
});
