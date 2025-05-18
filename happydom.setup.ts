import { GlobalRegistrator } from "@happy-dom/global-registrator";
import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";
import FakeTimers from "@sinonjs/fake-timers";

expect.extend(matchers);

GlobalRegistrator.register();

beforeEach(() => {
  global.clock = FakeTimers.install();
});

afterEach(() => {
  if (global.clock) {
    global.clock.uninstall();
  }
});

