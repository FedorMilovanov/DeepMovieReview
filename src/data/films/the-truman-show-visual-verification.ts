/**
 * Film 001 — visual master verification ledger.
 *
 * Control-plane data only: this file does not mutate the FilmPackage, does not
 * promote any scene and does not authorize publication.
 *
 * It closes the gap the promotion-readiness matrix could not close on its own:
 * `VISUAL_REVIEW` and `EDITORIAL_SCENE_VERIFICATION` for the current 39 research
 * evidence records.
 *
 * Evidence basis
 * --------------
 * Every `frameTimeSeconds` below was read out of the exact viewing master
 * (SHA-256 E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575,
 * measured runtime 6177.792 s) from the derived evidence bundle described in
 * docs/47-FILM-001-VISUAL-VERIFICATION.md.
 *
 * Verification statuses are deliberately conservative:
 *
 * - `VISUAL_CONFIRMED`   — the specific picture fact was seen at the stated time;
 * - `TRANSCRIPT_CONFIRMED` — only the dialogue/text claim was anchored; the
 *   picture-dependent part of the record stays unverified;
 * - `PENDING_LOCAL_REVIEW` — not yet verified in picture; the record stays
 *   fail-closed and may not become canonical evidence;
 * - `CONTRADICTED`       — the record's stated time or staging did not survive
 *   the check and must be rewritten before promotion.
 *
 * A record is only promotable once it is `VISUAL_CONFIRMED` or
 * `TRANSCRIPT_CONFIRMED` *and* its canonical scene is verified.
 */

export type TrumanVisualVerificationStatus =
  | "VISUAL_CONFIRMED"
  | "TRANSCRIPT_CONFIRMED"
  | "PENDING_LOCAL_REVIEW"
  | "CONTRADICTED";

export type TrumanObservedFrame = {
  /** Master timestamp the observation is read from. */
  frameTimeSeconds: number;
  /** What is actually visible / audible at that time. */
  observation: string;
};

export type TrumanVisualVerification = {
  evidenceId: string;
  status: TrumanVisualVerificationStatus;
  /** Canonical scene id the record belongs to after re-anchoring. */
  sceneId: string;
  frames: TrumanObservedFrame[];
  note: string;
};

const frame = (frameTimeSeconds: number, observation: string): TrumanObservedFrame => ({
  frameTimeSeconds,
  observation,
});

export const trumanVisualVerifications: TrumanVisualVerification[] = [
  {
    evidenceId: "truman-ev-daycount",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-day-10909",
    frames: [
      frame(163.9, "The caption «DAY 10,909» closes the cold open and hands over to the morning walk."),
    ],
    note:
      "The on-screen day number is confirmed. A second, physical counter reading «10910 / N° of Days Running» appears much later, at 1160 s inside truman-sc-lauren-sylvia; it belongs to that scene as its own observation and must not be folded into this record.",
  },
  {
    evidenceId: "truman-ev-greeting",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-day-10909",
    frames: [frame(169.796, "Morning signature greeting dialogue cue begins.")],
    note: "Dialogue is master-grounded; the direct-to-camera delivery is a staging detail still worth a local confirm.",
  },
  {
    evidenceId: "truman-ev-routine",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-day-10909",
    frames: [
      frame(170, "Neighbour greetings and the dog Pluto repeat in the same street order."),
      frame(290, "Truman is walked backwards by two identical-looking «neighbours» into the Kaiser billboard."),
    ],
    note: "The repetition is a staging pattern, confirmed across the opening walk.",
  },
  {
    evidenceId: "truman-ev-kaiser",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-day-10909",
    frames: [
      frame(285, "Street crossing toward the billboard."),
      frame(290, "Truman pinned against «Kaiser Chicken» billboard by two men; the ad fills the frame behind him."),
      frame(300, "Shot duration confirms the hold, not a passing glimpse."),
    ],
    note: "The record's claim that the blocking turns the man into advertising space is picture-confirmed.",
  },
  {
    evidenceId: "truman-ev-interviews",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-prologue",
    frames: [
      frame(19.1, "Interview audio: audiences are tired of «phoney emotions»."),
      frame(30, "Christof is framed against a lunar surface, i.e. inside the moon control room."),
    ],
    note: "Creator interview is the film's cold open; the moon interior is visible before the town is.",
  },
  {
    evidenceId: "truman-ev-light",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-day-10909",
    frames: [
      frame(210, "A studio lamp rig lies on the pavement; its housing is stencilled «SIRIUS (9 CANIS MAJOR)»."),
      frame(230.943, "Radio explains the debris as aircraft parts."),
    ],
    note: "Both the physical prop marking and the cover story are master-grounded.",
  },
  {
    evidenceId: "truman-ev-radio",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-paranoia",
    frames: [
      frame(1790, "Truman at the wheel, eyes on the mirror."),
      frame(1830, "Close-up of the car radio tuned to 92.5 as the production frequency breaks in."),
      frame(1798.265, "Production voice tracks his route; «stand by, all extras»."),
    ],
    note: "The radio prop and the intercepted production chatter are both confirmed.",
  },
  {
    evidenceId: "truman-ev-raincloud",
    status: "CONTRADICTED",
    sceneId: "truman-sc-paranoia",
    frames: [
      frame(1790, "Truman driving, no rain."),
      frame(1800, "Windscreen view, dry."),
      frame(1960, "Street scene, dry."),
    ],
    note:
      "The localized-rain beat is NOT present in chapter 08 as the research record places it, and the embedded English subtitle track has no rain cue anywhere in the film. Either this beat lives in a different, later context or the research record generalized a production anecdote. The current observation may not be promoted as written.",
  },
  {
    evidenceId: "truman-ev-quota",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-aquaphobia",
    frames: [
      frame(431.983, "Quota threat: «You'll lose more than your teeth»."),
      frame(432, "Colleague hands Truman the ferry assignment."),
    ],
    note: "Transcript-anchored. The school flashback half of the old record belongs to a different scene and must be split.",
  },
  {
    evidenceId: "truman-ev-drowning",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-memories-of-dad",
    frames: [
      frame(709, "Father in the boat: «I don't like that weather, son»."),
      frame(722.4, "Young Truman calls «Daddy!» as the storm takes him."),
    ],
    note: "The flashback is dialogue-anchored; the staging of the loss should be confirmed locally before publication.",
  },
  {
    evidenceId: "truman-ev-sylvia",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-lauren-sylvia",
    frames: [
      frame(1160, "Wall tally counter with the plaque «N° of Days Running» reads 10910."),
      frame(1460, "Library: Sylvia/«Lauren» in red opposite Truman between the stacks."),
      frame(1560, "Same library scene, closer, as she tries to tell him the truth."),
      frame(1615.201, "«It's fake. It's all for you.»"),
    ],
    note: "The staging (library stacks, red sweater, student look) and the disclosure line are both confirmed. The chapter also carries the physical day counter at 1160 s, which is the only diegetic proof that the show keeps counting.",
  },
  {
    evidenceId: "truman-ev-fiji",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-lauren-sylvia",
    frames: [
      frame(1644.899, "Departure-to-Fiji dialogue."),
      frame(1760, "Hands assembling a torn magazine face collage of Sylvia on the table."),
    ],
    note: "The collage is a physical set of torn fragments on the basement table, not a scrapbook montage effect.",
  },
  {
    evidenceId: "truman-ev-ghost",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-memories-of-dad",
    frames: [
      frame(910, "The man Truman recognizes, in the crowd, seen past a man in a dark hat and a red sweater."),
      frame(920, "Two men closing on him; the removal starts as physical force."),
    ],
    note:
      "The encounter and the seizure are both on screen. The «homeless exodus» newspaper that follows is confirmed separately in the europe record at 1830 s, so the two records now cite the same front page instead of two different ones.",
  },
  {
    evidenceId: "truman-ev-poster",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-travelers-beware",
    frames: [
      frame(2555.4, "Travel agency wall: «TRAVELLERS BEWARE» poster with a burning aircraft."),
      frame(2568, "Second poster: «IT COULD HAPPEN TO YOU!» over a shark."),
      frame(2583.365, "Truman asks for a flight to Fiji."),
    ],
    note: "The posters are diegetic wall art in the agency; the record's reading of them as institutional discouragement is picture-supported.",
  },
  {
    evidenceId: "truman-ev-mococoa",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-mococoa",
    frames: [
      frame(3226.152, "Meryl turns from the argument to the unseen camera and starts the Mococoa pitch."),
      frame(3240, "The pitch continues past Truman's disbelief."),
    ],
    note: "The placement is performed in-scene. The finished Mococoa commercial is later broadcast on a home TV at 3670 s, inside truman-sc-trutalk, and is a separate observation.",
  },
  {
    evidenceId: "truman-ev-beer",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-dreaming-of-fiji",
    frames: [
      frame(587.226, "«That is a beer.»"),
      frame(590, "Marlon on the bridge holding the can label-out toward camera."),
    ],
    note: "Label-facing gesture confirmed at the cue.",
  },
  {
    evidenceId: "truman-ev-bridge",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-im-being-spontaneous",
    frames: [
      frame(2950, "Truman turned fully around in the driver's seat, eyes shut, as Meryl grips the wheel."),
      frame(3010, "The car is on the bridge span over open water."),
      frame(3033.162, "«We're over the bridge!» is shouted."),
    ],
    note: "Both the fear-attack staging and the crossing are confirmed.",
  },
  {
    evidenceId: "truman-ev-plant",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-blocked-at-every-turn",
    frames: [
      frame(3122.337, "Officer: «You're welcome, Truman.»"),
      frame(3176, "Workers in silver hazmat suits cordon the road at the «Seahaven Nuclear Power Station»."),
    ],
    note: "The name slip and the fabricated emergency are both master-grounded.",
  },
  {
    evidenceId: "truman-ev-knife",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-mococoa",
    frames: [
      frame(3250, "Meryl, cornered by Truman's questions, holds the «Chef's Pal» dicer up in both hands."),
      frame(3272.199, "She calls for intervention: «Do something!»"),
    ],
    note:
      "Picture-confirmed with a correction: the object is not a kitchen knife but the earlier product-placement dicer, still in its blister packaging. The prop that advertised domestic order becomes the thing an actress threatens with, which tightens the record rather than weakening it.",
  },
  {
    evidenceId: "truman-ev-fingers",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-lauren-sylvia",
    frames: [
      frame(1700, "Close-up of a hand pinned with the «HOW'S IT GOING TO END?» button; the fingers are visibly crossed."),
      frame(1730, "The torn Sylvia face is held up immediately afterwards."),
    ],
    note:
      "Picture-confirmed, but the research record misplaces the prop: the crossed fingers belong to Truman's own lapel button in the basement sequence, not to a wedding photo. The observation text must be corrected before promotion.",
  },
  {
    evidenceId: "truman-ev-marlon",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-father-and-son-reunion",
    frames: [
      frame(3430, "Marlon at night on the bridge, close enough to read his face."),
      frame(3464.272, "«The last thing I would ever do...»"),
      frame(3469.903, "«...is lie to you.»"),
    ],
    note: "Staging and line are confirmed; the earpiece prompting remains a separate craft observation.",
  },
  {
    evidenceId: "truman-ev-reunion",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-trutalk",
    frames: [
      frame(3880.242, "Control room labels the explanation «amnesia»."),
      frame(3970, "Kirk, the returned father, in close-up."),
    ],
    note:
      "Both halves of the compound record are now located in picture: the embrace at 3610 s sits in truman-sc-father-and-son-reunion, while the invented «amnesia» explanation and Kirk's re-presentation at 3880–3970 s sit here, 270 s later. The record must be split before promotion, but nothing about it is unverified.",
  },
  {
    evidenceId: "truman-ev-escape",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-hes-gone",
    frames: [
      frame(4470, "Control room on night vision: the bed is occupied and still."),
      frame(4570, "The same camera angle shows the bed empty under the covers' shape."),
      frame(4642.986, "«He's gone.»"),
    ],
    note:
      "Picture-confirmed as a staged absence: the room camera keeps returning to the bed, so the audience sees the sleeper and then the absence in the identical framing. Correction: the underwater tunnel is not in this chapter — the only tunnel imagery available sits in the TruTalk chapter and does not show an escape route, so the record's «подкоп» must be rewritten or dropped.",
  },
  {
    evidenceId: "truman-ev-cuesun",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-hes-gone",
    frames: [
      frame(4810.033, "«Cue the sun» command in the control room."),
      frame(4820, "A wide night shot of Seahaven with the sky already brightening over the rooftops."),
    ],
    note:
      "Command and effect are both on screen: the same chapter that ends the broadcast shows the town lit up out of schedule while the search runs.",
  },
  {
    evidenceId: "truman-ev-boat",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-hes-gone",
    frames: [
      frame(4830, "Control room crew deciding how to search the water."),
      frame(4850, "Christof takes over as the boat is located."),
    ],
    note: "The search for a boat on open water is confirmed inside truman-sc-hes-gone; the sailing footage itself opens truman-sc-setting-sail and must be anchored there when the record is split.",
  },
  {
    evidenceId: "truman-ev-storm",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-cue-the-storm",
    frames: [
      frame(5169.945, "Truman challenges the storm."),
      frame(5173.407, "«You're gonna have to kill me!»"),
    ],
    note: "Defiance is master-grounded; the storm escalation is a craft observation handled separately.",
  },
  {
    evidenceId: "truman-ev-born-live",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-cue-the-storm",
    frames: [frame(5101.959, "Control room: «He was born on television.»")],
    note: "Dialogue only; no picture dependency.",
  },
  {
    evidenceId: "truman-ev-wall",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-skys-the-limit",
    frames: [
      frame(5270, "Boat drifting on the painted sea under a flat sky."),
      frame(5510, "Painted staircase rising to a flat panel edge against clouds."),
    ],
    note: "The horizon is confirmed to be a physical painted wall with a staircase, not a matte illusion.",
  },
  {
    evidenceId: "truman-ev-dialog",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-who-am-i",
    frames: [frame(5544.206, "«I'm the creator of a TV show...»")],
    note: "The creator conversation is anchored; the voice-from-the-sky staging is separately visible at 5510.",
  },
  {
    evidenceId: "truman-ev-nocamera",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-who-am-i",
    frames: [frame(5596.426, "«You never had a camera in my head.»")],
    note: "Dialogue only.",
  },
  {
    evidenceId: "truman-ev-exit",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-good-afternoon",
    frames: [
      frame(5695, "Truman in the open doorway, half-turned back toward the audience, mid-bow."),
      frame(5691.316, "Final signature greeting."),
    ],
    note: "The bow in the doorway and the line are both confirmed.",
  },
  {
    evidenceId: "truman-ev-guards",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-good-afternoon",
    frames: [
      frame(5755.382, "«What else is on?»"),
      frame(5757, "Two security guards at their post; one reaches for the remote."),
    ],
    note: "Epilogue staging confirmed.",
  },
  {
    evidenceId: "truman-ev-ferry",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-aquaphobia",
    frames: [
      frame(459.928, "«Ferry's still here, huh?» at the terminal."),
      frame(465, "Truman at the ramp, unable to board."),
    ],
    note: "The retreat is confirmed at the ramp, not merely reported.",
  },
  {
    evidenceId: "truman-ev-elevator",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-paranoia",
    frames: [
      frame(2100.409, "Later dialogue retells the elevator incident."),
      frame(2110, "Shelving corridor behind a false office wall, crew visible."),
      frame(2170, "The two men watching from the fake office at night."),
    ],
    note: "The backstage reveal is confirmed as a physical set, not only narrated.",
  },
  {
    evidenceId: "truman-ev-trutalk",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-trutalk",
    frames: [
      frame(4058.134, "TruTalk states Truman could leave."),
      frame(4079.739, "«...Truman prefers his cell.»"),
      frame(4110, "The host Simeon in the red studio set."),
    ],
    note: "Interview staging and both claims are confirmed.",
  },
  {
    evidenceId: "truman-ev-sleep",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-do-you-think-he-knows",
    frames: [
      frame(4200, "Christof silhouetted in front of the giant «ON AIR» screen."),
      frame(4214.8, "«Hey, Simeon» as the control room reopens."),
    ],
    note: "Creator-at-the-monitor composition confirmed.",
  },
  {
    evidenceId: "truman-ev-conception",
    status: "TRANSCRIPT_CONFIRMED",
    sceneId: "truman-sc-trutalk",
    frames: [frame(4122.283, "«TV's first on-air conception» is announced.")],
    note: "Dialogue only; the couple scene is handled by its own record.",
  },
  {
    evidenceId: "truman-ev-album",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-no-place-like-home",
    frames: [
      frame(2222.262, "The mother opens the family album on the sofa."),
      frame(2227.7, "«My little clown» over the album page she lingers on."),
    ],
    note: "The album is a physical prop handled on camera; the record's «scheduled nostalgia» reading is supported.",
  },
  {
    evidenceId: "truman-ev-europe",
    status: "VISUAL_CONFIRMED",
    sceneId: "truman-sc-paranoia",
    frames: [
      frame(1830, "The Island newspaper, hand-held and fully legible: «CRACKDOWN ON HOMELESS — City Fathers say \"Enough is Enough!\"»."),
    ],
    note:
      "Picture-confirmed, but the record cites a headline that does not exist («Who needs Europe?»). The real front page is a homeless crackdown, which serves the same control argument. The observation text must be rewritten before promotion.",
  },
];

export const trumanVisualVerificationSummary = {
  records: trumanVisualVerifications.length,
  visualConfirmed: trumanVisualVerifications.filter((r) => r.status === "VISUAL_CONFIRMED").length,
  transcriptConfirmed: trumanVisualVerifications.filter(
    (r) => r.status === "TRANSCRIPT_CONFIRMED",
  ).length,
  pendingLocalReview: trumanVisualVerifications.filter(
    (r) => r.status === "PENDING_LOCAL_REVIEW",
  ).length,
  contradicted: trumanVisualVerifications.filter((r) => r.status === "CONTRADICTED").length,
} as const;
