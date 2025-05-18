import { type Clock } from "@sinonjs/fake-timers";

declare global {
  // eslint-disable-next-line no-var
  var clock: Clock;
}

export {};
