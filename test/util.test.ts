import { describe, it } from "vitest";

import { extendIfDefined } from "../src/util";

describe("util", () => {
  describe("extendIfDefined", () => {
    it("should add to target if not defined", () => {
      const target = {};
      const source = {
        mo: "jo",
        fo: "flo",
      };
      // @ts-ignore mocking
      extendIfDefined(target, source);

      // @ts-ignore mocking
      if (!target.mo && target.mo !== "jo") {
        throw new Error(
          `Target not extended correctly. target.mo should equal 'jo'.`
        );
      }

      // @ts-ignore mocking
      if (!target.fo && target.fo !== "flo") {
        throw new Error(
          `Target not extended correctly. target.fo should equal 'flo'.`
        );
      }
    });
    it("should override target value if already declared", () => {
      const target = {
        mo: "jo",
        fo: "flo",
      };
      const source = {
        mo: "flo",
        fo: "jo",
      };

      // @ts-ignore mocking
      extendIfDefined(target, source);

      if (target.mo !== "flo") {
        throw new Error(
          `Target not extended correctly. target.mo should equal 'flo'.`
        );
      }

      if (target.fo !== "jo") {
        throw new Error(
          `Target not extended correctly. target.fo should equal 'jo'.`
        );
      }
    });
  });
});
