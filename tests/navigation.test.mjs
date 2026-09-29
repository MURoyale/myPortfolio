import test from 'node:test';
import assert from 'node:assert/strict';
import { initialNavigation, navigationReducer } from '../src/lib/navigation.ts';
const reduce = (state, action) => navigationReducer(state, action, 6);
const open = (state, index, scrollTop = 0) => reduce(state, { type: 'select', index, scrollTop });

test('Classic Up/Down visit every section and stop at edges', () => {
  for (const columns of [1]) {
    let state = initialNavigation;
    const visited = [state.selected];
    for (let i = 0; i < 5; i++) { state = reduce(state, { type: 'move', direction: 'down', columns }); visited.push(state.selected); }
    assert.deepEqual(visited, [0, 1, 2, 3, 4, 5]);
    assert.equal(reduce(state, { type: 'move', direction: 'down', columns }).selected, 5);
    for (let i = 0; i < 5; i++) state = reduce(state, { type: 'move', direction: 'up', columns });
    assert.equal(state.selected, 0);
    assert.equal(reduce(state, { type: 'move', direction: 'up', columns }).selected, 0);
  }
});
test('horizontal movement only changes a choice within the same grid row', () => {
  assert.equal(reduce(initialNavigation, { type: 'move', direction: 'right', columns: 1 }).selected, 0);
  const right = reduce(initialNavigation, { type: 'move', direction: 'right', columns: 2 });
  assert.equal(right.selected, 1);
  assert.equal(reduce(right, { type: 'move', direction: 'right', columns: 2 }).selected, 1);
});
test('Back restores the menu selection and scroll position', () => {
  const selected = reduce(initialNavigation, { type: 'highlight', index: 4 });
  const state = open(selected, 4, 82);
  const back = reduce(state, { type: 'back' });
  assert.equal(back.selected, 4); assert.equal(back.open, false); assert.equal(back.scrollTop, 82);
});
test('chapter history restores content cursor and reading position', () => {
  let state = open(initialNavigation, 2);
  state = reduce(state, { type: 'cursor', id: 'next-section' });
  state = open(state, 3, 418);
  const back = reduce(state, { type: 'back' });
  assert.equal(back.selected, 2); assert.equal(back.cursor, 'next-section'); assert.equal(back.scrollTop, 418);
});
test('Back closes nested content before leaving its section', () => {
  let state = open(initialNavigation, 2);
  state = reduce(state, { type: 'toggle', id: 'project-case-study', scrollTop: 177 });
  assert.deepEqual(state.expanded, ['project-case-study']);
  state = reduce(state, { type: 'back' });
  assert.equal(state.open, true); assert.equal(state.selected, 2);
  assert.deepEqual(state.expanded, []); assert.equal(state.cursor, 'project-case-study'); assert.equal(state.scrollTop, 177);
  state = reduce(state, { type: 'back' });
  assert.equal(state.open, false);
});
test('Home clears nested history and repeated Back is safe', () => {
  let state = open(initialNavigation, 1);
  state = reduce(state, { type: 'toggle', id: 'skill-Interface', scrollTop: 90 });
  state = reduce(state, { type: 'home' });
  assert.equal(state.selected, 0); assert.equal(state.open, false); assert.deepEqual(state.history, []);
  assert.deepEqual(reduce(state, { type: 'back' }), state);
});
test('layout changes do not require or mutate navigation state', () => {
  const state = open(initialNavigation, 5);
  assert.deepEqual(reduce(state, { type: 'move', direction: 'right', columns: 2 }), state);
});
test('direct pointer opening preserves its menu selection on Back', () => {
  const back = reduce(open(initialNavigation, 5), { type: 'back' });
  assert.equal(back.selected, 5);
});
test('closing nested disclosures preserves a coherent Back chain', () => {
  let state = open(initialNavigation, 1);
  state = reduce(state, { type: 'toggle', id: 'first', scrollTop: 30 });
  state = reduce(state, { type: 'toggle', id: 'second', scrollTop: 90 });
  state = reduce(state, { type: 'toggle', id: 'second', scrollTop: 130 });
  assert.deepEqual(state.expanded, ['first']);
  state = reduce(state, { type: 'back' });
  assert.equal(state.open, true); assert.deepEqual(state.expanded, []);
  state = reduce(state, { type: 'back' });
  assert.equal(state.open, false);
});

test('Wide vertical movement preserves columns without wrapping left', () => {
  for (const start of [0, 1]) {
    let state = { ...initialNavigation, selected: start };
    for (const expected of [start + 2, start + 4, start + 4]) {
      state = reduce(state, { type: 'move', direction: 'down', columns: 2 });
      assert.equal(state.selected, expected);
    }
    for (const expected of [start + 2, start, start]) {
      state = reduce(state, { type: 'move', direction: 'up', columns: 2 });
      assert.equal(state.selected, expected);
    }
  }
  const lastRight = { ...initialNavigation, selected: 3 };
  assert.equal(navigationReducer(lastRight, { type: 'move', direction: 'down', columns: 2 }, 5).selected, 3);
});
