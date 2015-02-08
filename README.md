AutoRemovePlus
==============

AutoRemovePlus is a plugin for [Deluge](http://deluge-torrent.org) that
you can use to automatically remove torrents. Its
based on AutoRemove 0.1 by Jamie Lennox.

This is a GtkUI and WebUI plugin.

Features
--------
- Select how many torrents are allowed at the same time.
- Choose to remove them based on multiple criteria age, seed time or ratio.
- Select if torrents have to fulfill both of either criteria.
- Delete torrents in order (e.g. delete torrents with highest ratio first).
- Don't remove torrents if they don't reach a minimum time (in days) or ratio.
- Choose the removal interval.
- Right click and select torrents that you don't want automatically removed.
- Remove torrent data option.
- Create an exempted tracker list, so that torrents that belong to those trackers are not removed.
- Fully functional WebUI.  

Usage
-----
Look for torrents to remove every day:

> Check every: 1

Look for torrents to remove every hour: 

> Check every: 0.0416

Remove every torrent that meets minimum criteria: 

> Maximum torrents: 0

Don't remove torrents unless Deluge has over 500: 

> Maximum torrents: 500

Remove torrents that have a ratio over 2.0 and have been seeding for at least 4 days: 

> Remove by: Ratio, Min: 2.0, and, Remove by: Seed Time, Min: 4  

Remove torrents that have a ratio over 2.0 or have been seeding for at least 4 days: 

> Remove by: Ratio, Min: 2.0, or, Remove by: Seed Time, Min: 4

Remove torrents only according to first criteria: 

> Remove by: Ratio, Min: 2.0, and, Remove by: Seed Time, Min: 0 (second condition needs to be always true with and)

The rest of the options are pretty self explanatory 