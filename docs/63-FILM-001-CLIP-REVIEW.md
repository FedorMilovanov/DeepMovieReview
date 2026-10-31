# Film 001: selected-frame check of the supplied scene archive

Checked 2026-10-30 UTC (31 October in Europe/Moscow). This is a check of **individual frames**, not continuous viewing or audio listening. The original full master was not present and its hash was not recomputed by this check.

The 12 Drive parts' MD5s matched Drive metadata. Their concatenation's SHA-256 was `8695B425E30CA46B812EF02457E9F1314D8544A8F981255DCAD6EEDD38016932`, matching the supplied digest. `unzip -t` passed; all 10 root-level MP4 hashes matched the archive's README. The ZIP also contains a duplicate directory of those clips. Its README asserts master SHA-256 `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`; that assertion does **not** independently prove the clip-to-master link. The original video clips are not in the repository; the selected article stills are documented below.

Source-time estimates below are the selected clip times plus the start offset **stated by the README**, not independently measured master presentation timestamps:

- `05-marlon-long-interval.mp4` (`0BBC78A1DE8C6B2FB9E7965EB534A5347D63F6BADBE344FF607E607A533C5744`): sampled ~55:48 and ~55:52 show different close-ups, within the interval where the original 0.32 detector found no transition. This is a concrete missed transition, not evidence of a continuous shot.
- `03-library.mp4` (`4E07890E11FC88341F4E3885F5F54D22165FB7E8C4EA5970E019A91B7B8C2415`): sampled frames show a changing composition including Truman, other library visitors and later a woman in red. A caption describing them together cannot describe the whole window.
- `04-meryl-kitchen.mp4` (`F4ADFA6E7FFABECCAB4F8D98633F8ED9B5B6715C062F286A8CA457DCC3738B4F`): ~54:15 shows packaging on the table; ~54:25 and ~54:30 show Meryl with tools; ~54:35 shows Truman holding her on a monitor. These sampled images do not establish intentions or who speaks.
- `07-father-reunion.mp4` (`5D4D696D6240124B86E287BE108AAB70BB2938CAF064D742AF4B8E8ABB4DAB18`): ~59:51 shows the embrace outside by bridge railings, ~1:00:11 on a control-room monitor; sampled intermediate and later images show the control room, a person at a keyboard and spectators. They do not establish Marlon's precise role in arranging the meeting.

## Stills placed in the article

The two additional grid stills are the supplied `05-frames/f_00026.jpg` (nominal 750 s, rain) and `05-frames/f_00116.jpg` (nominal 3450 s, Truman on a monitor). They are copied byte-for-byte into `assets/film-stills/`; their labels disclose the 30-second nominal grid rather than claiming independently verified frame PTS.

Three further stills were taken from the supplied MP4s, independently of that grid. On 2026-10-31 UTC the relevant parts were checked against Drive MD5, the clip payloads against the SHA-256 values listed above, and individual frames were decoded with FFmpeg 7.0.2 and resized to 800×450. The AVIF versions were made from the displayed JPEGs. The clip offsets below are requested positions, not independently measured master PTS:

| Still | Supplied clip | Requested clip offset | Estimated source time from manifest | Shows |
| --- | --- | ---: | ---: | --- |
| `truman-meryl-tools-3265.jpg` | `04-meryl-kitchen.mp4` | 60 s | ~3265 s | Meryl holding kitchen tools |
| `truman-kitchen-screen-3275.jpg` | `04-meryl-kitchen.mp4` | 70 s | ~3275 s | Truman holding Meryl, on a monitor |
| `truman-reunion-3591.jpg` | `07-father-reunion.mp4` | 6 s | ~3591 s | Truman and Kirk embracing by bridge railings |

The registry records the SHA-256 of both image formats, each clip hash and its manifest range. None of this independently verifies the absent master or establishes intentions, dialogue, or a licence. For an auditable precise timing or dialogue claim, obtain the original master, map the source PTS, and review the relevant continuous picture and audio.
