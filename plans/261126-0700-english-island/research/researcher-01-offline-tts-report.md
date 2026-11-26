# Offline TTS for English Island audio (~490 clips)

Scope: 400 words + 26 letters + ~60 sentences, pre-generated, committed to public repo, served from Vercel.
Method note: 5-tool-call cap. Voice licenses VERIFIED from raw MODEL_CARD files; Kokoro license verified from HF card; engine licenses/CLI flags from prior knowledge (marked "unverified").

## 1. Verdict (ranked)

1. **Kokoro-82M, voice `af_heart` (fallback `af_bella`/`af_nicole`)** - Apache-2.0 weights, best naturalness, 24 kHz native.
2. **Piper `en_US-ljspeech-high`** - dataset public domain; clean, slightly flat; zero license doubt. Fallback if Kokoro single-word output is glitchy.
3. Piper `en_US-libritts_r-medium` (CC BY 4.0, needs attribution credit) - only if you want a many-speaker choice.
4. espeak-ng - reject (robotic, GPL-3, bad for kids learning pronunciation).
5. Coqui XTTS - reject (CPML non-commercial; Coqui defunct, license stays).

## 2. Engine licenses - do they taint the audio?

| Engine | License | Matters for output? |
|---|---|---|
| Kokoro (`kokoro` pip pkg, weights) | Apache-2.0 | No. Weights Apache; no restrictions on output. |
| Piper old (rhasspy/piper) | MIT, archived | No. |
| Piper1-gpl (OHF-Voice) | GPL-3.0 (unverified, per repo name) | Generally no: GPL covers the program, not its output. Do NOT vendor engine code into the repo; keep generator script out of shipped bundle or just run it locally. |
| espeak-ng | GPL-3.0 | Output usually fine, but phoneme backend is GPL; Kokoro/misaki also shells out to it for OOV words (system dependency, not bundled). |
| Coqui XTTS-v2 | CPML (non-commercial) | Yes - excluded. |

Real risk is the **voice/dataset license**, not the engine. Public repo + free game = still safest to use only permissive/ attributable data (repo is redistributable by anyone).

## 3. Piper en_US voices - verified MODEL_CARD licenses

Source pattern: https://huggingface.co/rhasspy/piper-voices/raw/main/en/en_US/{voice}/{quality}/MODEL_CARD

| Voice | Dataset license (as printed) | Redistribute audio? |
|---|---|---|
| ljspeech (high) | public domain | YES - best Piper pick |
| kristin, norman, john (medium) | public domain (LibriVox) | YES |
| bryce (medium) | public domain (author's own voice) | YES |
| joe (medium) | CC0 | YES |
| sam (medium) | Apache-2.0 | YES (non-binary voice, finetuned from CC0 base) |
| libritts_r (medium, 904 spk) | CC BY 4.0 | YES with attribution (credit LibriTTS-R, openslr.org/141) |
| amy (medium) | "See URL" (Mycroft mimic3-voices); finetuned from Hi-Fi TTS 92 base | UNCLEAR - avoid until the mimic3-voices repo license is confirmed |
| lessac (low/medium/high) | Blizzard 2013 custom license (cstr.ed.ac.uk .../lessac_blizzard2013/license.html) | UNCLEAR/custom - AVOID unless you read and accept that license |
| ryan | CC BY-NC-SA 4.0 | AVOID (non-commercial + share-alike) |
| hfc_female / hfc_male | CC BY-NC-SA 4.0 (NICT Hi-Fi-Captain) | AVOID (NC) |

Note: hfc_male is finetuned from lessac -> inherits lessac issue too.
Sources: https://huggingface.co/rhasspy/piper-voices (repo-level tag only: MIT, says nothing per voice), cards above.

## 4. Kokoro-82M

- Weights Apache-2.0; card states trained "exclusively on permissive/non-copyrighted audio data and IPA phoneme labels"; lists public domain, Apache/MIT audio, plus CC BY sets (Koniwa tnc, SIWIS) and synthetic audio from closed TTS models. https://huggingface.co/hexgrad/Kokoro-82M
- 54 voices, 8 languages (v1.0); `af_heart` is the card's example and the community-top-graded US voice (grade from VOICES.md not fetched - unverified).
- Residual risk: synthetic-from-closed-TTS training data is a provenance gray area; license text itself grants Apache rights. Low practical risk, nonzero. Piper ljspeech is the zero-doubt fallback.
- Sample rate 24 kHz. Runs on CPU on Apple Silicon; 490 short clips = minutes.
- Install (macOS, Python 3.10-3.12):
  ```
  brew install espeak-ng ffmpeg
  python3.12 -m venv .venv && . .venv/bin/activate
  pip install "kokoro>=0.9.2" soundfile
  ```
- Batch (one wav per id):
  ```python
  import soundfile as sf, json
  from kokoro import KPipeline
  p = KPipeline(lang_code='a')            # American English
  for id, text in json.load(open('items.json')).items():
      for _, _, a in p(text, voice='af_heart', speed=0.9):   # slower for kids
          sf.write(f'wav/{id}.wav', a, 24000); break
  ```
  Long sentences may split into several chunks - concatenate instead of `break` for the 60 sentences.
- Single-word caveat: very short inputs can get odd prosody/clipped ends. Mitigation: generate "word." (trailing period) and listen to all 426 once (~5 min); regenerate bad ones with alternate punctuation or `speed`. Letter names: feed spelled form ("bee", "cee", "dee", "ay") not "B" - avoids "capital B" or initialism guesses.

## 5. Piper CLI (fallback)

- Old: `pip install piper-tts` (rhasspy, MIT, archived). New: OHF-Voice/piper1-gpl, also `pip install piper-tts` (GPL-3.0) - same package name, newer releases are the GPL line (unverified).
- Download voice: `python3 -m piper.download_voices en_US-ljspeech-high` (unverified flag names).
- Generate: `echo "apple" | piper -m en_US-ljspeech-high -f wav/apple.wav` (one call per clip; loop in shell). 22.05 kHz native for ljspeech-high.
- Voice files also directly at huggingface.co/rhasspy/piper-voices/.../en_US/ljspeech/high/ (.onnx + .onnx.json).
- Speed control: `--length-scale 1.15` (slower).

## 6. Quality for isolated child-directed words (judgment, not benchmarked)

| Engine/voice | Clarity single words | Warmth | Notes |
|---|---|---|---|
| Kokoro af_heart | high | high (female, friendly) | Best; occasional short-input artifacts. |
| Piper ljspeech-high | good | medium, slightly flat/monotone | Very consistent on isolated words. |
| Piper libritts_r | variable per speaker | varies | Pick one speaker id; need audition. |
| espeak-ng | intelligible, robotic | low | Teaches wrong prosody. |
No peer-reviewed comparison read; judgments from model cards/community reports - audition 20 hard words (e.g. "thumb", "knee", "yellow") before bulk run.

## 7. Conversion to MP3 (iOS Safari compatible)

Per-file, mono, 24 kHz, 40 kbps CBR, trim silence both ends, peak-normalise, no metadata:
```
ffmpeg -y -i wav/apple.wav -af \
 "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,\
 volume=0dB,alimiter=limit=0.89" \
 -ac 1 -ar 24000 -c:a libmp3lame -b:a 40k -map_metadata -1 -id3v2_version 0 -write_xing 0 mp3/apple.mp3
```
- Trim: leading 30 ms kept, trailing 80 ms kept (avoids clicks/cut-off consonants). Threshold -45 dB; raise to -40 if breath noise remains.
- Loudness: `loudnorm` needs ~3 s of audio for stable integrated-loudness; unreliable on 0.5 s words. Prefer batch peak/RMS normalise first: `pip install ffmpeg-normalize` then `ffmpeg-normalize wav/*.wav -nt rms -t -20 -ext wav -of norm/` (per-file RMS -20 dBFS), then limiter at ~-1 dBFS as above. One voice -> levels already near-uniform; this is mainly to equalise words vs sentences.
- iOS Safari: MP3 Layer III MPEG-2 (24/22.05 kHz) plays; `-write_xing 0` avoids Safari duration/gap quirks on tiny files. Any gapless or latency need: preload via Web Audio `decodeAudioData` (tiny files, trivial) and unlock on first user tap (iOS autoplay rule).
- Alternative AAC/M4A ~ same size; MP3 is simplest, universal.

## 8. Size estimate (40 kbps CBR = 5 KB/s)

| Class | Count | Avg duration after trim | Size each | Subtotal |
|---|---|---|---|---|
| Words | 400 | 0.6-0.9 s | 3-4.5 KB | 1.2-1.8 MB |
| Letters | 26 | 0.5-0.7 s | 3-3.5 KB | ~0.09 MB |
| Sentences | 60 | 2-3.5 s | 10-17 KB | 0.6-1.0 MB |
| **Total (~486)** | | | | **~2-3 MB** (expect ~2.5 MB) |
At 32 kbps ~2.0 MB; at 48 kbps ~3.0 MB. Negligible for Vercel and git; keep wav out of repo (`.gitignore`), commit only mp3 + the `items.json` source list and generation script (without engine code).

## 9. Risk / fit

- Maturity: Kokoro popular, active, v1.0 Jan 2025; Piper stable but repo split/archive (rhasspy archived, successor GPL) - pinning versions matters. Both offline, no API cost.
- Fit: static asset pipeline, one-time script, no runtime dependency -> low adoption risk either way. Regenerating later requires pinned versions + same voice for consistent timbre.
- Commit the audio only; record voice + license + model version in an `AUDIO-CREDITS.md` (needed for CC BY if libritts_r is ever used; good practice otherwise).

## Limits of this research
- Per-voice licenses read from model cards only; did not read each upstream dataset license page (Lessac Blizzard, mimic3-voices/Amy) - hence "unclear".
- Kokoro VOICES.md grades, piper1-gpl license text and CLI flags not fetched (cap 5 calls).
- No listening test done; quality ratings are secondary-source judgment.

## Unresolved questions
1. Does Kokoro's "synthetic audio from closed TTS" training portion matter to you for a public repo? If yes, go Piper ljspeech-high.
2. Amy: confirm license in MycroftAI/mimic3-voices if you prefer her voice.
3. Lessac Blizzard 2013 license: does it permit redistribution of synthesized audio in a free public product? (Not read.)
4. Female vs male voice, US accent only? (Assumed female US.)
5. Slow speed target for kids (0.9 assumed) - audition needed.
6. Confirm current piper1-gpl CLI flags (`--output-dir`, `--length-scale`) by running `piper --help`.
