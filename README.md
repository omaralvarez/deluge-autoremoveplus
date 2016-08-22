AutoRemovePlus
==============

AutoRemovePlus is a plugin for [Deluge](http://deluge-torrent.org) that
you can use to automatically remove torrents. Its
based on AutoRemove 0.1 by Jamie Lennox.

This is a GtkUI and WebUI plugin.

Features
--------
- Select how many torrents are allowed at the same time.
- Choose to remove or pause them based on multiple criteria age, seeders, seed time or ratio.
- Set specific removal rules depending on tracker or label.
- Remove only torrents from specific trackers or labels.
- Only remove torrents if under a certain HDD space threshold.
- Select if torrents have to fulfill both or either criteria.
- Delete torrents in order (e.g. delete torrents with highest ratio first).
- Don't remove torrents if they don't reach a minimum time (in days) or ratio.
- Choose the removal interval.
- Right click and select torrents that you don't want automatically removed.
- Remove torrent data option.
- Create an exempted tracker or label list, so that torrents that belong to those trackers or labels are not removed.
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

Delete torrents even if HDD space not under minimum:

> Minimum HDD space: -1

Only remove torrents when the main HDD has less than 10 GB free:

> Minimum HDD space: 10

Remove torrents that have a ratio over 2.0 and have been seeding for at least 4 days:

> Remove by: Ratio, Min: 2.0, and, Remove by: Seed Time, Min: 4  

Remove torrents that have a ratio over 2.0 or have been seeding for at least 4 days:

> Remove by: Ratio, Min: 2.0, or, Remove by: Seed Time, Min: 4

Remove torrents only according to first criteria:

> :black_small_square: Second Remove by: criteria

Pause torrents instead of removing them:

> :black_small_square: Remove torrents

The rest of the options are pretty self explanatory

Building
--------

Run:

```
python setup.py bdist_egg
```

The resulting `AutoRemovePlus-x-py2.x.egg` file can be found in the `/dist` directory.

Workarounds
-----------

If after building the egg file, the plugin does not load in Deluge:

- Delete the `AutoRemovePlus-x-py2.x.egg` in `/deluge/plugins` directory.
- Delete the `AutoRemovePlus.conf` files.
- Restart Deluge.
