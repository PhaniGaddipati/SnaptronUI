# SnaptronUI

A webapp frontend to query exon-exon junction data from the [Intropolis database](https://github.com/nellore/intropolis) via [Snaptron](https://github.com/ChristopherWilks/snaptron)

Development deployment available here: [stingray.cs.jhu.edu:8100](stingray.cs.jhu.edu:8100)

## Prerequisites
- [MeteorJS](https://www.meteor.com/)

Additional packages will be loaded by Meteor on first run.

## Deploying SnaptronUI
  - `git clone https://github.com/PhaniGaddipati/SnaptronUI.git`
  - `cd SnaptronUI/SnaptronApp`
  - `meteor --production`
    - Windows may required `meteor.bat --production`

The server will now be running on port 3000.
