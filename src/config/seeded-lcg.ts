// Park-Miller minimal-standard LCG (multiplier 16807, modulus 2^31 - 1), as inlined in the
// original world scatter/decoration and map decor code. Returns values in [0, 1].

const MODULUS = 2147483647;
const MULTIPLIER = 16807;

/** Creates a deterministic generator; same seed -> same stream as the original bundle. */
export function createSeededLcg(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return (state - 1) / (MODULUS - 1);
  };
}
