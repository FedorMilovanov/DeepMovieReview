# Film 001 — additional original-master frames, second staging batch

Recorded 2026-11-04. This document supplements docs/74, preserving its
historical first batch. The five images were sampled from the same
13,099,008,485-byte owner-local The Truman Show (1998) BDRip.mkv. The file's
SHA-256 was independently verified in docs/72:
`E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`.

Each FFmpeg input seek is an **approximate source second**, not a certified
presentation timestamp. Each original film image was Lanczos-scaled to
800×450 and encoded separately to JPEG and AVIF. No AI enhancement, fabricated
frames, generated typography or spliced compositions were used.

| Still stem (JPEG + AVIF) | Seek sec | Evidence ID | JPEG SHA-256 | AVIF SHA-256 |
| --- | ---: | --- | --- | --- |
| `truman-sylvia-1605` | 1605 | `truman-ev-sylvia` | `d6019cd2bebbf10aa84cdecf20db8286185c246bbf9226491ac9e999864c3347` | `a396fe08b0394709f8ec1ae013c063d83d7a8bf2b1cb4e18fa906432e799fd3c` |
| `truman-elevator-2110` | 2110 | `truman-ev-elevator` | `474888a8610e15442a9155395c3fdb637dbeb9d3a3d84f6c18bbd3d88e815b64` | `af3115a1e741c6fcbcc68545a924ebab4c37f3233c8a32072c8ac429991ab1d4` |
| `truman-mococoa-3230` | 3230 | `truman-ev-mococoa` | `430f783eabfc19df5e487b904e3c441025e7eb12e1643ac1ddeadb0177bce833` | `7db19191f3c8d65a676cdf7550940c2f1eee521d84b43c87985e4469f86a28fa` |
| `truman-school-3848` | 3848 | `truman-ev-nothing-left` | `9c1cd8e9bc1c8d983c1dd11abfe9d3acaea6afca6248f033aea789390c427eb5` | `712a6373b0531935189c60b2dad39604cd55bef733c6376027549919837809b4` |
| `truman-christof-monitor-4052` | 4052 | `truman-ev-seahaven-design` | `f66d7f18d3041a702c66726d0e7b31869319307255485aacf744c5a903a1c6a3` | `41c1377da7cfde0fb8acec147aff1436284fb1317fb191958f7ab17e909594ef` |

## Evidentiary and editorial boundaries

- Sylvia (1605 s) and Truman are shown together; the audio phrase near
  1615.201 s is not visually certified by this picture.
- The elevator (2110 s) shows the technical opening and equipment, not the
  arrangement of the entire unseen set.
- Meryl presents a Mococoa container (3230 s); the utterance is evidenced
  separately by the film dialogue and subtitles.
- The school frame (source seek 3847.7 s, registered near 3848 s) shows
  young Truman in a classroom, not the teacher's exact spoken sentence.
- The television frame (source seek 4052.5 s, registered near 4052 s) shows
  Christof; his motives and sincerity cannot be inferred from it.

Total in the DRAFT PR after this batch: **19 distinct frames**, with
38 encoded binaries: 6 historical grid images, 3 clip-derived images
and 10 directly sampled images. Existing timeline/evidence IDs are reused,
the exact film edition provenance is retained, and spoiler limits remain
unchanged. Complete byte hashes and negative mutation regression checks
remain required for each registered still.

## Rights and publication decision

These frames are staged in a public GitHub draft at the owner's request, not
legally cleared. Their authenticity, critical attribution and SHA-256 do not
establish film copyright permission. Under Issue #43, obtain and record an
image-specific quotation / criticism legal basis or permission for **all 19**
individual stills, the intended jurisdiction and host, and the disposition
of any rejected picture. Do not merge to protected main, open indexing,
disable the stills switch, or bypass CI before those decisions are complete.
