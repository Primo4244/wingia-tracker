#!/usr/bin/env python3
"""
Maison Automobile — original temp score + sound design, synthesised from scratch.

Everything here is generated procedurally (numpy only), so it is 100 % owned
and license-free. It is a TEMP TRACK: structure, tempo and hit points are
final, so a composer / library track can be swapped in on the same grid.

Grid: 120 BPM, 30 fps  ->  1 beat = 0.5 s = 15 frames, 1 bar = 2 s = 60 frames.

Output (public/audio):
  music.wav                 the score stem (27 s)
  sfx_*.wav                 individual one-shots, placed by frame in Remotion
"""
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

BEAT = 0.5
DUR = 27.0


# ----------------------------------------------------------------- utilities
def t_axis(d):
    return np.arange(int(d * SR)) / SR


def write(name, x, stereo=None):
    """x: mono or (n,2). Normalised softly then written as 16-bit stereo."""
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    peak = np.max(np.abs(x)) + 1e-9
    x = x / peak * 0.89
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def onepole_lp(x, cutoff):
    """Time-varying one-pole lowpass. cutoff: scalar or array (Hz)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    z = 0.0
    for i in range(len(x)):
        z = (1 - a[i]) * x[i] + a[i] * z
        y[i] = z
    return y


def hp(x, cutoff):
    return x - onepole_lp(x, cutoff)


def fft_lp(x, cutoff, slope=4.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(X, len(x))


def fft_bp(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / hi) ** 8) * (1 - 1 / np.sqrt(1 + (f / lo) ** 8))
    return np.fft.irfft(X, len(x))


def reverb(x, seconds=2.4, mix=0.25, predelay=0.02, damp=6000, seed=1):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        ir = r.standard_normal(n) * np.exp(-6.9 * t / seconds)
        ir = fft_lp(ir, damp, 2)
        ir[: int(predelay * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        irs.append(ir)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    out = np.zeros((len(x) + n - 1, 2))
    N = int(2 ** np.ceil(np.log2(len(x) + n)))
    for c in range(2):
        out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], N) * np.fft.rfft(irs[c], N), N)[: len(x) + n - 1]
    wet = out[: len(x)]
    return x * (1 - mix) + wet * mix


def saw_additive(freq, t, harmonics=12, detune_cents=0.0, phase=0.0):
    f = freq * 2 ** (detune_cents / 1200)
    y = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if f * k > SR / 2.2:
            break
        y += np.sin(2 * np.pi * f * k * t + phase * k) / k * (1 / (1 + (k / (harmonics * 0.45)) ** 2))
    return y


def adsr(n, a, d, s, r, sustain_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    if sustain_len is None:
        sustain_len = max(0, n - a - d - r)
    env = np.concatenate([
        np.linspace(0, 1, max(a, 1)),
        np.linspace(1, s, max(d, 1)),
        np.full(int(sustain_len), s),
        np.linspace(s, 0, max(r, 1)),
    ])
    if len(env) < n:
        env = np.concatenate([env, np.zeros(n - len(env))])
    return env[:n]


def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]


def note(n):
    return 440 * 2 ** ((n - 69) / 12)


# --------------------------------------------------------------- instruments
def kick(level=1.0, length=0.6, f0=110, f1=42):
    t = t_axis(length)
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = fft_bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 300) * 0.25
    return (body + click) * level


def hat(level=0.2, length=0.09, open_=False):
    t = t_axis(0.45 if open_ else length)
    n = rng.standard_normal(len(t))
    n = fft_bp(n, 7000, 16000)
    env = np.exp(-t * (9 if open_ else 55))
    return n * env * level


def rim(level=0.25):
    t = t_axis(0.12)
    tone = np.sin(2 * np.pi * 1650 * t) * np.exp(-t * 60)
    n = fft_bp(rng.standard_normal(len(t)), 1200, 5000) * np.exp(-t * 80)
    return (tone * 0.5 + n) * level


def pluck(freq, level=0.2, length=0.32):
    t = t_axis(length)
    y = saw_additive(freq, t, 10) * np.exp(-t * 14)
    y = onepole_lp(y, 2600 * np.exp(-t * 6) + 300)
    return y * level


# ---------------------------------------------------------------------- score
def build_music():
    n = int(DUR * SR)
    L = np.zeros(n)  # drums / mono elements
    P = np.zeros((n, 2))  # pads / stereo

    # chord loop per 2 s bar, starting at 3.0 s : Dm | Bb | F | C
    chords = [
        (38, [62, 65, 69, 72, 76]),  # D  : D F A C E
        (34, [58, 62, 65, 69, 72]),  # Bb : Bb D F A C
        (41, [60, 65, 69, 72, 76]),  # F  : C F A C E
        (36, [60, 64, 67, 71, 74]),  # C  : C E G B D
    ]
    groove_start, groove_end = 3.0, 20.5

    # --- intro: cold, thin fluorescent tone + sparse low drone (0 – 3 s)
    t = t_axis(3.2)
    hum = (np.sin(2 * np.pi * 120 * t) * 0.03 + np.sin(2 * np.pi * 240 * t) * 0.012)
    hum *= np.clip(t / 0.05, 0, 1) * np.clip((3.0 - t) / 0.02, 0, 1)
    place(L, hum, 0)
    drone = saw_additive(note(38), t, 6) * 0.05 * np.clip(t / 2.5, 0, 1) ** 2
    drone *= np.clip((3.0 - t) / 0.01, 0, 1)
    place(L, onepole_lp(drone, 400), 0)

    # --- groove
    beat_times = np.arange(groove_start, groove_end - 1e-6, BEAT)
    for i, bt in enumerate(beat_times):
        sec = 'A' if bt < 11 else ('B' if bt < 16 else 'C')
        place(L, kick(0.95 if i % 4 == 0 else 0.8), bt)
        # offbeat hats
        place(L, hat(0.11 if sec == 'A' else 0.15), bt + BEAT / 2)
        if sec != 'A':
            place(L, hat(0.05), bt + BEAT / 4)
            place(L, hat(0.05), bt + 3 * BEAT / 4)
        if sec in ('B', 'C') and i % 2 == 1:
            place(L, rim(0.22), bt)
        if sec == 'C' and i % 4 == 3:
            place(L, hat(0.08, open_=True), bt + BEAT / 2)

    # bass: 8th pulses, sidechained feel through the envelope
    for bar_i, bar_t in enumerate(np.arange(groove_start, groove_end - 1e-6, 2.0)):
        root, tones = chords[bar_i % 4]
        for k in range(16):
            st = bar_t + k * BEAT / 2
            if st >= groove_end:
                break
            tt = t_axis(BEAT / 2)
            f = note(root)
            y = saw_additive(f, tt, 9) + np.sin(2 * np.pi * f / 2 * tt) * 0.9
            env = np.clip(tt / 0.012, 0, 1) * np.exp(-tt * 5)
            # duck on the beat (where the kick lives)
            if k % 2 == 0:
                env *= np.clip(tt / 0.09, 0.15, 1)
            cutoff = 220 + (420 if bar_t >= 11 else 120) + 250 * np.exp(-tt * 18)
            y = onepole_lp(y * env, cutoff) * 0.55
            place(L, y, st)

        # pad
        tt = t_axis(2.0)
        pad = np.zeros((len(tt), 2))
        for j, m in enumerate(tones):
            for c, det in enumerate((-7, 7)):
                pad[:, c] += saw_additive(note(m), tt, 7, det + j, phase=j)
        env = adsr(len(tt), 0.25, 0.4, 0.8, 0.35)
        pad *= env[:, None] * 0.035
        if bar_t >= 16:
            pad *= 1.25
        P[int(bar_t * SR): int(bar_t * SR) + len(tt)] += pad[: n - int(bar_t * SR)]

        # arp in B / C sections
        if bar_t >= 11:
            seq = [tones[0], tones[2], tones[4], tones[1] + 12, tones[3], tones[2] + 12, tones[4], tones[1]]
            for k in range(16):
                st = bar_t + k * BEAT / 4 * 2  # 8ths across bar
                if st >= groove_end:
                    break
                m = seq[k % len(seq)] + 12
                pl = pluck(note(m), 0.11 if bar_t < 16 else 0.14)
                pan = 0.5 + 0.35 * np.sin(k * 1.3)
                seg = np.stack([pl * (1 - pan), pl * pan], 1)
                i0 = int(st * SR)
                j0 = min(n, i0 + len(seg))
                P[i0:j0] += seg[: j0 - i0]
                # dotted-8th echo
                ed = int((st + 0.375) * SR)
                je = min(n, ed + len(seg))
                if ed < n:
                    P[ed:je] += seg[: je - ed][:, ::-1] * 0.35

    # --- brand section: silence at 20.5, then a single sustained chord at 21.5 s
    t = t_axis(5.5)
    final = np.zeros((len(t), 2))
    for j, m in enumerate([50, 57, 62, 64, 69, 72]):  # D5-ish open voicing (Dadd9)
        for c, det in enumerate((-5, 5)):
            final[:, c] += saw_additive(note(m), t, 6, det, phase=j * 0.7)
    env = adsr(len(t), 0.05, 1.2, 0.55, 2.8)
    final *= env[:, None] * 0.05
    final[:, 0] = onepole_lp(final[:, 0], 1800)
    final[:, 1] = onepole_lp(final[:, 1], 1800)
    sub = np.sin(2 * np.pi * note(26) * t) * np.exp(-t * 0.9) * 0.35
    final += sub[:, None]
    i0 = int(21.5 * SR)
    P[i0:i0 + len(t)] += final[: n - i0]
    # soft heartbeat pulses under the end card
    for bt in (22.5, 23.5, 24.5, 25.5):
        place(L, kick(0.32, 0.8, 70, 38), bt)

    mix = np.stack([L, L], 1) + P
    mix = reverb(mix, 2.6, 0.22)
    # master fade
    tt = np.arange(n) / SR
    mix *= np.clip((DUR - tt) / 1.2, 0, 1)[:, None]
    # gentle saturation
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    write('music.wav', mix)


# ----------------------------------------------------------------------- sfx
def sfx():
    # counter tick — a dry, slightly cold mechanical tick
    t = t_axis(0.08)
    x = fft_bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 160)
    x += np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 220) * 0.4
    write('sfx_tick.wav', x)

    # ticket "ding" — institutional two-tone chime, cold and short
    t = t_axis(1.1)
    x = np.zeros_like(t)
    for f, at, a in ((1318.5, 0, 1.0), (987.8, 0.16, 0.9)):
        tt = np.clip(t - at, 0, None)
        g = (t >= at) * np.exp(-tt * 4.5)
        x += (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 9)) * g * a
    write('sfx_ding.wav', reverb(x, 1.2, 0.2))

    # text stamp — tight low thump + paper click
    t = t_axis(0.25)
    x = np.sin(2 * np.pi * (70 + 80 * np.exp(-t * 40)) * t) * np.exp(-t * 22)
    x += fft_bp(rng.standard_normal(len(t)), 900, 5000) * np.exp(-t * 120) * 0.35
    write('sfx_stamp.wav', x)

    # premium UI click — two micro transients
    t = t_axis(0.09)
    x = np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 260)
    x2 = np.zeros_like(t)
    o = int(0.018 * SR)
    x2[o:] = np.sin(2 * np.pi * 3400 * t[:-o]) * np.exp(-t[:-o] * 320) * 0.6
    write('sfx_click.wav', x + x2)

    # car pass-by — doppler rumble + air, 1.4 s, peak at ~0.65 s
    t = t_axis(1.4)
    peak = 0.65
    d = (t - peak)
    amp = 1 / (1 + (d / 0.16) ** 2)
    f_engine = 62 * np.where(d < 0, 1.12, 0.86)
    ph = 2 * np.pi * np.cumsum(f_engine) / SR
    rumble = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3.02 * ph)) * amp
    air = rng.standard_normal(len(t))
    cutoff = 400 + 5200 * amp
    air = onepole_lp(air, cutoff) * amp * 0.9
    x = rumble * 0.6 + air
    pan = np.clip(0.5 + d * 1.6, 0, 1)
    st = np.stack([x * (1 - pan) * 1.4, x * pan * 1.4], 1)
    write('sfx_passby.wav', reverb(st, 1.4, 0.15))

    # soft whoosh (short, for type and cuts) — 0.45 s, peak near the end
    for name, length, pk, lo, hi in (('sfx_whoosh.wav', 0.5, 0.36, 300, 4200), ('sfx_whoosh_fast.wav', 0.28, 0.2, 500, 7000)):
        t = t_axis(length)
        env = np.exp(-((t - pk) / (pk * 0.45)) ** 2)
        n = rng.standard_normal(len(t))
        x = onepole_lp(n, lo + (hi - lo) * env) * env
        x = hp(x, 150)
        pan = np.linspace(0.25, 0.75, len(t))
        write(name, np.stack([x * (1 - pan), x * pan], 1))

    # bass impact — sub drop + body + air tail
    t = t_axis(2.2)
    f = 34 + 70 * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 2.2)
    x += fft_bp(rng.standard_normal(len(t)), 80, 900) * np.exp(-t * 14) * 0.5
    x += fft_bp(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t * 40) * 0.12
    write('sfx_impact.wav', reverb(x, 2.0, 0.18))

    # deep brand hit — longer, darker, with a metallic shimmer layer
    t = t_axis(4.0)
    f = 30 + 55 * np.exp(-t * 10)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 1.1)
    shimmer = np.zeros_like(t)
    for k, fr in enumerate((523.3, 784.0, 1174.7, 1568.0)):
        shimmer += np.sin(2 * np.pi * fr * t + k) * np.exp(-t * (1.4 + k * 0.4)) * (0.08 / (k + 1))
    x += shimmer
    x += fft_bp(rng.standard_normal(len(t)), 60, 600) * np.exp(-t * 8) * 0.35
    write('sfx_brandhit.wav', reverb(x, 3.5, 0.3))

    # headlight ignition — electrical rise + soft settle
    t = t_axis(1.2)
    f = 180 + 520 * (1 - np.exp(-t * 9))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) * 0.3 + np.sin(ph * 2.01) * 0.12) * np.clip(t / 0.03, 0, 1) * np.exp(-t * 3.2)
    x += fft_bp(rng.standard_normal(len(t)), 3000, 12000) * np.exp(-t * 25) * 0.25
    write('sfx_ignite.wav', reverb(x, 1.6, 0.25))

    # riser — 1.0 s noise + tone sweep into the drop
    t = t_axis(1.0)
    env = (t / 1.0) ** 2.2
    n = rng.standard_normal(len(t))
    x = onepole_lp(n, 300 + 9000 * env) * env
    f = 220 * 2 ** (t * 2.0)
    x += np.sin(2 * np.pi * np.cumsum(f) / SR) * env * 0.25
    x *= np.clip((1.0 - t) / 0.01, 0, 1)
    write('sfx_riser.wav', np.stack([x * 0.9, x], 1))

    # keys — small cluster of inharmonic metallic tinks (elegant, not cartoon)
    t = t_axis(0.9)
    x = np.zeros_like(t)
    for at, base, a in ((0.0, 3150, 1.0), (0.055, 4210, 0.6), (0.12, 2890, 0.45), (0.2, 5020, 0.25)):
        tt = np.clip(t - at, 0, None)
        g = (t >= at)
        for ratio, dec in ((1, 9), (1.51, 14), (2.76, 22), (3.98, 30)):
            x += np.sin(2 * np.pi * base * ratio * tt) * np.exp(-tt * dec) * g * a / ratio
    write('sfx_keys.wav', reverb(x, 0.9, 0.18))

    # slot / selector roll — a rapid run of micro ticks (0.6 s)
    t = t_axis(0.62)
    x = np.zeros_like(t)
    times = np.cumsum(np.linspace(0.028, 0.07, 12))
    for k, at in enumerate(times):
        if at >= 0.6:
            break
        tt = t_axis(0.03)
        tk = np.sin(2 * np.pi * (2400 + 90 * k) * tt) * np.exp(-tt * 300) * (0.5 + 0.5 * k / 12)
        place(x, tk, at)
    write('sfx_roll.wav', x)

    # typewriter-ish data ticks (for coordinates / typed labels)
    t = t_axis(0.03)
    x = fft_bp(rng.standard_normal(len(t)), 3000, 11000) * np.exp(-t * 400)
    write('sfx_type.wav', x)

    # air — a soft breath of room tone for the silence before the brand
    t = t_axis(1.6)
    n = onepole_lp(rng.standard_normal(len(t)), 900)
    env = np.sin(np.pi * t / 1.6) ** 2
    write('sfx_air.wav', np.stack([n * env, np.roll(n, 300) * env], 1))


if __name__ == '__main__':
    sfx()
    build_music()
    print('audio written to', os.path.abspath(OUT))
