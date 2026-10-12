"""Masters a render to -14.0 LUFS integrated with true peak at or under -1.0 dBTP, trimmed to length.
Two-pass loudnorm; the target is nudged until the measured result lands in spec.
Usage: master.py <in.mp4> <out.mp4> <seconds>"""
import json, re, subprocess, sys

src, dst, seconds = sys.argv[1], sys.argv[2], sys.argv[3]

def measure(path):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summary = err[err.rindex('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', summary).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', summary).group(1))

target, tp = -14.0, -1.2
for _ in range(8):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-t', seconds, '-af', f'loudnorm=I={target}:TP={tp}:LRA=11:print_format=json', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    m = json.loads(err[err.rindex('{'):err.rindex('}') + 1])
    af = (f"loudnorm=I={target}:TP={tp}:LRA=11:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
          f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']},aresample=48000")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-t', seconds, '-c:v', 'copy', '-af', af, '-c:a', 'aac', '-b:a', '256k', dst], check=True)
    i, peak = measure(dst)
    print(f'target {target:.2f} / {tp:.2f} -> {i:.1f} LUFS, {peak:.1f} dBTP')
    if peak > -1.0:
        tp -= 0.2
    elif abs(i + 14.0) > 0.05:
        target += -14.0 - i
    else:
        break
