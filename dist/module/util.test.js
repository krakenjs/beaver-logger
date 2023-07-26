import { describe, it } from "vitest";
import { extendIfDefined } from ".";
describe("util", function () {
  describe("extendIfDefined", function () {
    it("should add to target if not defined", function () {
      var target = {};
      var source = {
        mo: "jo",
        fo: "flo"
      };
      extendIfDefined(target, source);
      if (!target.mo && target.mo !== "jo") {
        throw new Error("Target not extended correctly. target.mo should equal 'jo'.");
      }
      if (!target.fo && target.fo !== "flo") {
        throw new Error("Target not extended correctly. target.fo should equal 'flo'.");
      }
    });
    it("should override target value if already declared", function () {
      var target = {
        mo: "jo",
        fo: "flo"
      };
      var source = {
        mo: "flo",
        fo: "jo"
      };
      extendIfDefined(target, source);
      if (target.mo !== "flo") {
        throw new Error("Target not extended correctly. target.mo should equal 'flo'.");
      }
      if (target.fo !== "jo") {
        throw new Error("Target not extended correctly. target.fo should equal 'jo'.");
      }
    });
  });
});