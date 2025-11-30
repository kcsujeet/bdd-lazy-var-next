import { expect } from "chai";

export {};

const describe = (global as any).describe;
const it = (global as any).it;

declare const spy: any;
declare const includeExamplesFor: any;
declare const subject: any;
declare const def: any;
declare const get: any;

function getVar(name: string) {
  return get[name];
}

includeExamplesFor("Root Lazy Vars", getVar);

describe('Lazy vars defined as getter on "get" function', function () {
  includeExamplesFor("Lazy Vars Interface", getVar);

  subject(function () {
    return {};
  });

  describe("by default", function () {
    subject(function () {
      return {};
    });

    def("firstName", "John");
    def("anotherVar", "Doe");

    try {
      get.bddLazyCounter = 2;
      def("bddLazyCounter", 5);
    } catch {
      get.bddLazyCounter = null;
    }

    it("defines a getter for lazy variable", function () {
      // eslint-disable-next-line
      expect(get.subject).to.exist;
    });

    it('allows to access lazy variable value by checking property on "get" function', function () {
      expect(get.subject).to.equal(subject());
    });

    it("forwards calls to `get` function when access variable", function () {
      var accessor = spy();
      var originalGet = (global as any).get;

      (global as any).get = accessor;
      // eslint-disable-next-line
      originalGet.anotherVar;
      (global as any).get = originalGet;

      expect(accessor).to.have.been.called.with("anotherVar");
    });

    it("does not allow to redefine existing variable in global context", function () {
      // eslint-disable-next-line
      expect(get.bddLazyCounter).to.be.null;
    });
  });
});
