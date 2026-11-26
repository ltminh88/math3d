#!/usr/bin/env python3
"""Synthesise WAV clips with Kokoro-82M (Phase 2C).

Reads a JSON list of {id, tts} items and writes one 24 kHz WAV per id.
Long inputs may split into several chunks — they are concatenated, never
truncated. Called by generate-clips.mjs with the project's Kokoro venv;
never bundled into the game.
"""
import argparse
import json
import os

import soundfile as sf
from kokoro import KPipeline


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', required=True, help='JSON list of {id, tts}')
    parser.add_argument('--out', required=True, help='WAV output dir')
    parser.add_argument('--voice', default='af_heart')
    parser.add_argument('--speed', type=float, default=0.9)
    args = parser.parse_args()

    with open(args.items, encoding='utf-8') as f:
        items = json.load(f)
    os.makedirs(args.out, exist_ok=True)
    pipe = KPipeline(lang_code='a')  # American English
    for item in items:
        audio: list[float] = []
        for _graphemes, _phonemes, chunk in pipe(item['tts'], voice=args.voice, speed=args.speed):
            audio.extend(chunk.tolist())
        sf.write(os.path.join(args.out, f"{item['id']}.wav"), audio, 24000)
    print(f"synthesized {len(items)} wavs")


if __name__ == '__main__':
    main()
