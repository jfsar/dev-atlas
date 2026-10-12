import { describe, expect, it } from "vitest";

import { createRateLimiter } from "~/lib/rate-limit.server";

describe("createRateLimiter", () => {
  it("allows up to the limit within a window", () => {
    const clock = 0;
    const consume = createRateLimiter({
      limit: 3,
      windowMs: 1000,
      now: () => clock,
    });

    expect(consume("ip").allowed).toBe(true);
    expect(consume("ip").allowed).toBe(true);
    expect(consume("ip").allowed).toBe(true);
    expect(consume("ip").allowed).toBe(false);
  });

  it("reports remaining attempts and retry delay", () => {
    const clock = 0;
    const consume = createRateLimiter({
      limit: 2,
      windowMs: 1000,
      now: () => clock,
    });

    const first = consume("ip");
    expect(first.remaining).toBe(1);
    consume("ip");
    const blocked = consume("ip");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(1000);
  });

  it("tracks keys independently", () => {
    const clock = 0;
    const consume = createRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: () => clock,
    });

    expect(consume("a").allowed).toBe(true);
    expect(consume("b").allowed).toBe(true);
    expect(consume("a").allowed).toBe(false);
  });

  it("resets after the window elapses", () => {
    let clock = 0;
    const consume = createRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: () => clock,
    });

    expect(consume("ip").allowed).toBe(true);
    expect(consume("ip").allowed).toBe(false);
    clock = 1000;
    expect(consume("ip").allowed).toBe(true);
  });

  it("sweeps expired buckets after the window elapses", () => {
    let clock = 0;
    const consume = createRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: () => clock,
    });

    consume("a");
    consume("b");
    consume("c");
    expect(consume.size).toBe(3);

    clock = 1000;
    consume("d");
    expect(consume.size).toBe(1);
  });

  it("bounds the number of tracked keys", () => {
    const consume = createRateLimiter({
      limit: 5,
      windowMs: 1000,
      now: () => 0,
      maxKeys: 100,
    });

    for (let index = 0; index < 1000; index++) consume(`ip-${index}`);

    expect(consume.size).toBeLessThanOrEqual(100);
  });
});
