# SnaptronUI

A webapp frontend to query exon-exon junction data from the [Intropolis database](https://github.com/nellore/intropolis) via [Snaptron](https://github.com/ChristopherWilks/snaptron)

Development deployment available here: [http://stingray.cs.jhu.edu:8100](http://stingray.cs.jhu.edu:8100)

Example query of the FOSB gene, with a filter based on sample count:
![preview](https://cloud.githubusercontent.com/assets/2693873/14548412/a5a2f238-0284-11e6-96cb-4f26c06be128.png)

## Prerequisites
- [MeteorJS](https://www.meteor.com/)

Additional packages will be loaded by Meteor on first run.

## Deploying SnaptronUI
  - `git clone https://github.com/PhaniGaddipati/SnaptronUI.git`
  - `cd SnaptronUI/SnaptronApp`
  - `meteor --production`
    - Windows may required `meteor.bat --production`

The server will now be running on port 3000.
