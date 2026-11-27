# English audio credits

Clips in this folder are pre-generated with **Kokoro-82M** (voice `af_heart`,
speed 0.9), engine version `0.9.4`.

- Kokoro-82M weights and code: Apache License 2.0 (Apache-2.0)
  (https://huggingface.co/hexgrad/Kokoro-82M).
- Synthesised audio carries no additional restriction from the engine license.
- Fallback engine (only if Kokoro output is unusable for a clip):
  Piper `en_US-ljspeech-high`, public domain dataset.
- Generator: `tools/english-audio/generate-clips.mjs` (deterministic;
  re-running it regenerates only clips whose text changed).
