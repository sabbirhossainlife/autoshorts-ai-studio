import { describe, it, expect } from "vitest"; import fs from "fs"; import path from "path"; import os from "os";
import { renderVideo, probe } from "../src/services/ffmpeg.js";
describe("ffmpeg smoke render", ()=>{
  it("produces a valid 1080x1920 MP4", async ()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),"autoshorts-"));
    const out=path.join(dir,"short.mp4"); const thumb=path.join(dir,"thumb.jpg");
    const r=await renderVideo({scenes:[{narration:"Hello world", durationSec:2, subtitle:"Hello world"},{narration:"Second scene", durationSec:2, subtitle:"Second scene"}], audioPath:null, outputPath:out, thumbnailPath:thumb});
    expect(fs.existsSync(out)).toBe(true); expect(r.width).toBe(1080); expect(r.height).toBe(1920); expect(fs.existsSync(thumb)).toBe(true);
    const info=await probe(out); expect(info.streams.find(s=>s.codec_type==="video").codec_name).toBe("h264");
  }, 120000);
});
