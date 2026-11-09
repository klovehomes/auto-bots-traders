# PolyCrypt9000 Avatar / Traderbot.ai Logo Note

Keith's uploaded Traderbot.ai artwork was used to replace the
PolyCrypt9000 avatar and to brand the in-app email gate.

## Source

- Upload: `1000018810_2_ftka.png`
- Actual encoded format detected during processing: JPEG
- Dimensions: 1600 × 1600

## Processing

The artwork's cyan-ring core has a 1576 × 1576 bounding square at
approximately x=13..1588, y=11..1586 in the source. The processed
image uses a closely matching 1580 × 1580 crop, `(11, 9)` to
`(1591, 1589)`, with a small safety margin. That crop was resized to
512 × 512 and encoded as WebP at quality 85.

The resulting avatar fills its circular/rounded presentation frame:
the robot's head and cash stack remain inside the image, the cyan
ring stays visible at the edge, and the Traderbot.ai wordmark remains
legible across the bottom.

## Files

- Replaced avatar: `app/packages/web/public/avatars/polycrypt9000.webp`
- Gate-screen logo copy: `app/packages/web/public/pm-logo.webp`
- Gate-screen integration: `app/packages/web/src/GateScreen.tsx`
- Gate logo sizing: `app/packages/web/src/styles.css`

No avatar-path code change was required: `avatars.tsx` already maps
`polycrypt9000` to `/avatars/polycrypt9000.webp`.

## GitHub delivery note

The parent's GitHub snapshot-push route is text-only and cannot carry
the replacement binary. A deliverable copy of the processed avatar is
provided separately as `polycrypt9000.webp` so Keith can upload it
through the GitHub web interface at
`app/packages/web/public/avatars/polycrypt9000.webp`, replacing the
binary at the same path. This is the same delivery limitation that
applied to the earlier v17 logo PNG.
