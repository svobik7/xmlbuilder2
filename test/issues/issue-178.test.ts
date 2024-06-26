import $$ from '../TestHelpers';

describe('Replicate issue', () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/90
  describe(`#178 - Namespace is removed when importing fragments.`, () => {
    const expectedOutput = $$.t`<?xml version="1.0"?><Root xmlns="ns1"><Parent xmlns="ns2"><Child xmlns="ns3"><GrandChild xmlns="ns4">txt</GrandChild></Child></Parent></Root>`;
    describe(`with defined namespaces on each element`, () => {
      test(`using .ele()`, () => {
        const doc = $$.create();
        const root = doc.ele('ns1', 'Root');
        const parent = root.ele('ns2', 'Parent');
        const child = parent.ele('ns3', 'Child');
        child.ele('ns4', 'GrandChild').txt('txt');

        expect(doc.end()).toBe(expectedOutput);
      });
      test(`using .import()`, () => {
        const doc = $$.create();
        const root = doc.ele('ns1', 'Root');
        const parent = $$.fragment().ele('ns2', 'Parent');
        const child = $$.fragment().ele('ns3', 'Child');
        const grandChild = $$.fragment().ele('ns4', 'GrandChild').txt('txt');

        child.import(grandChild);
        parent.import(child);
        root.import(parent);

        expect(doc.end()).toBe(expectedOutput);
      });
    });
    describe(`with undefined namespaces on parent element`, () => {
      const expectedOutput = $$.t`<?xml version="1.0"?><Root xmlns="ns1"><Parent><Child xmlns="ns3"><GrandChild xmlns="ns4">txt</GrandChild></Child></Parent></Root>`;
      test(`using .ele()`, () => {
        const doc = $$.create();
        const root = doc.ele('ns1', 'Root');
        const parent = root.ele('Parent');
        const child = parent.ele('ns3', 'Child');
        child.ele('ns4', 'GrandChild').txt('txt');

        expect(doc.end()).toBe(expectedOutput);
      });
      test(`using .import()`, () => {
        const doc = $$.create();
        const root = doc.ele('ns1', 'Root');
        const parent = $$.fragment().ele('Parent');
        const child = $$.fragment().ele('ns3', 'Child');
        const grandChild = $$.fragment().ele('ns4', 'GrandChild').txt('txt');

        child.import(grandChild);
        parent.import(child);
        root.import(parent);

        expect(doc.end()).toBe(expectedOutput);
      });
    });
  });
});
