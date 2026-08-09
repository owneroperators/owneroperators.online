---
title: "Thirty-Two Bars of Slander"
date: 2026-06-29
draft: false
summary: "The site's spectrum display accused the single of being bass-heavy. The single was innocent. Then the meter stopped lying about the record and started altering it. A field note on instruments that get into the signal path."
tags: ["echoes and static", "field notes"]
nobg: true
---

There's a strip of little gray bars under the player on the front page - a spectrum display, thirty-two of them, bouncing along with the single. I put it there because a song about static should get to watch itself move. Mostly it minds its own business. (If you're reading this on an iPhone, they're not bouncing. Hold that thought. It's the end of the story.)

Then I noticed it was all bottom. Play **Echoes and Static** and the left edge of the display stood up like a stadium wave that never travels - three bars doing all the work, twenty-nine barely breathing. Which reads, to anyone who has ever sat in front of studio monitors at an irresponsible hour, as: _your mix is bass-heavy._ Mud. Too much low end. I did what you do with an accusation like that. I took it personally.

So before touching a single fader I put the record on trial. Asked my collaborator (still an AI, still being transparent about it) whether the master needed work; it subpoenaed the meter instead. Ran the actual file through the actual math, band by band, octave by octave. Verdict: innocent. The energy peaks right where warmth lives, 120 to 250 hertz. The sub territory underneath is _quieter_ than that - four decibels quieter, no flab down there at all. From the peak, the whole record slopes off at about two and a half decibels per octave, which is more or less the shape of every record you have ever loved. Loudness sits square in the streaming pocket. There is no mud.

The meter was lying. And it was lying honestly, which is the worst kind.

A spectrum analyzer counts frequency the way a machine counts: evenly. One hertz is worth exactly as much as any other hertz. Split the audible range into thirty-two equal slices that way and the first slice runs from zero to about seven hundred hertz - the kick, the bass, and the fundamental of nearly every instrument we own, all crammed into bar number one. Everything you could whistle lands in the first three. The remaining twenty-nine divide up cymbal shimmer and air. On a display like that, every record ever mastered looks like a subwoofer demo. It wasn't measuring our mix. It was measuring its own design, precisely.

An ear doesn't count hertz. An ear hears octaves - doublings - the same distance from 100 to 200 as from 5,000 to 10,000. The fix was to make the bars listen the way ears do: each octave gets the same amount of screen. Now the display shows the record as it actually sits - warm at the shoulder, sloping off into the highs like tape.

Field note, filed under things the manual already knew: the tools you build to watch your own work will lie to you in the shape of their own design. The meter wasn't broken. It measured exactly what it was built to measure, which happened to be the wrong thing, perfectly. We very nearly remastered a record to please a bar chart.

The bars are honest now. Or at least they lie in octaves, like the rest of us.

That held for about a month.

Then the single started playing sharp. Not on my machine, where nothing is ever wrong - on a phone, which is how nearly everyone will ever hear it. Eight percent fast, eight percent sharp, the whole song leaning forward like it had somewhere to be. I had met that number before. It's the bug from the karaoke night, the midnight one, the sample-rate mismatch that kept the video from being ready. Eight percent is what you get when a 44.1kHz file is read by a 48kHz engine. Somebody in the chain was doing the arithmetic wrong.

It was the bars. It had been the bars in June, too. I just never looked up from the meter long enough to notice I was standing inside it.

Here's the part I didn't know when I built the thing. To draw thirty-two bars bouncing, you have to hand the song to an audio engine and ask it what it sees - and the browser's engine doesn't hand it back. Route playback through it and it doesn't observe the song, it _becomes_ the song. When the engine runs at a different rate than the file, everyone downstream hears the difference. The meter wasn't sitting beside the record anymore. It was holding it, running it eight percent hot, so it would have something to draw.

We fixed it three times. Pin the engine to the file's rate: pitch correct, plus a permanent resampler that hiccups every time you plug in headphones. Unpin it: hiccups gone, chipmunk back. Two fixes, one argument - where to put the meter - which is how you know they were the same wrong answer wearing different clothes.

The third one wasn't a fix, it was a demotion. The bars get a copy now. The song goes to your speakers the way it always did, untouched, and a duplicate goes off to the display to be looked at. Same picture, no hands on the master.

Except on an iPhone, where the browser won't make you a copy. There it's the signal path or nothing, so I took nothing. The bars are still down there, still moving, but they aren't listening to a thing - a screensaver with a good alibi. Thirty-two honest bars is a nice thing to have. The song in tune is the whole job.

Field note, filed as an amendment to the one above: the first version of this meter lied about what the record was. The second version changed it. I built both, and right up until a phone told on me I'd have sworn I was only watching.

On a phone the bars are quiet now. The song isn't. I'd make that trade again.

- Eric
