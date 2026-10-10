import fs from 'fs';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(4);
// Use a pinned local browser when one is available (cloud container, or
// REMOTION_BROWSER). Elsewhere (e.g. Windows/macOS), Remotion downloads its own.
const browser = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(browser)) {
	Config.setBrowserExecutable(browser);
}
