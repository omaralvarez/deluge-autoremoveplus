#
# core.py
#
# Copyright (C) 2011 Jamie Lennox <jamielennox@gmail.com>
#
# Basic plugin template created by:
# Copyright (C) 2008 Martijn Voncken <mvoncken@gmail.com>
# Copyright (C) 2007-2009 Andrew Resch <andrewresch@gmail.com>
# Copyright (C) 2009 Damien Churchill <damoxc@gmail.com>
#
# Deluge is free software.
#
# You may redistribute it and/or modify it under the terms of the
# GNU General Public License, as published by the Free Software
# Foundation; either version 3 of the License, or (at your option)
# any later version.
#
# deluge is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with deluge.    If not, write to:
# 	The Free Software Foundation, Inc.,
# 	51 Franklin Street, Fifth Floor
# 	Boston, MA  02110-1301, USA.
#
#    In addition, as a special exception, the copyright holders give
#    permission to link the code of portions of this program with the OpenSSL
#    library.
#    You must obey the GNU General Public License in all respects for all of
#    the code used other than OpenSSL. If you modify file(s) with this
#    exception, you may extend this exception to your version of the file(s),
#    but you are not obligated to do so. If you do not wish to do so, delete
#    this exception statement from your version. If you delete this exception
#    statement from all source files in the program, then also delete it here.
#

from deluge.log import LOG as log
from deluge.plugins.pluginbase import CorePluginBase
import deluge.component as component
import deluge.configmanager
from deluge.core.rpcserver import export

from twisted.internet import reactor

DEFAULT_PREFS = {
    'max_seeds' : -1,
    'filter' : 'func_ratio',
    'count_exempt' : False,
    'remove_data' : False
}

def _get_ratio((i, t)): 
    return t.get_ratio()

def _date_added((i, t)): 
    return -t.time_added 

filter_funcs = { 
    'func_ratio' : _get_ratio, 
    'func_added' : lambda (i, t): -t.time_added 
}

live = True

class Core(CorePluginBase):

    def enable(self):
        log.debug ("AutoRemove: Enabled")
        self.config = deluge.configmanager.ConfigManager("autoremove.conf", DEFAULT_PREFS)
        self.torrent_states = deluge.configmanager.ConfigManager("autoremovestates.conf", {})
        
        # Safe after loading to have a default configuration if no gtkui is available
        self.config.save()
        self.torrent_states.save()
        

        eventmanager = component.get("EventManager")
        eventmanager.register_event_handler("TorrentFinishedEvent", self.do_remove)

        # it appears that if the plugin is enabled on boot then it is called before the 
        # torrents are properly loaded and so do_remove receives an empty list. So we must 
        # listen to SessionStarted for when deluge boots but we still have apply_now so that 
        # if the plugin is enabled mid-program do_remove is still run
        eventmanager.register_event_handler("SessionStartedEvent", self.do_remove)       

    def disable(self):
        eventmanager = component.get("EventManager")
        eventmanager.deregister_event_handler("TorrentFinishedEvent", self.do_remove)
        eventmanager.deregister_event_handler("SessionStartedEvent", self.do_remove)

    def update(self):
        # why does update only seem to get called when the plugin is enabled in this session ??
        pass

    @export
    def set_config(self, config):
        """Sets the config dictionary"""
        for key in config.keys():
            self.config[key] = config[key]
        self.config.save()
        self.do_remove()

    @export
    def get_config(self):
        """Returns the config dictionary"""
        return self.config.config

    @export 
    def get_remove_rules(self): 
        return {
            'func_ratio' : 'Ratio',  
            'func_added' : 'Date Added'
        }

    @export
    def get_ignore(self, torrent_ids): 
        if not hasattr(torrent_ids, '__iter__'): 
            torrent_ids = [torrent_ids] 

        return [ self.torrent_states.config.get(t, False) for t in torrent_ids ] 

    @export 
    def set_ignore(self, torrent_ids, ignore = True): 
        log.debug ("AutoRemove: Setting torrents %s to ignore=%s" % (torrent_ids, ignore))

        if not hasattr(torrent_ids, '__iter__'): 
            torrent_ids = [torrent_ids] 

        for t in torrent_ids: 
            self.torrent_states[t] = ignore 

        self.torrent_states.save()

    # we don't use args or kwargs it just allows callbacks to happen cleanly
    def do_remove(self, *args, **kwargs): 
        log.debug("AutoRemove: do_remove")

        max_seeds = self.config['max_seeds'] 
        count_exempt = self.config['count_exempt']
        remove_data = self.config['remove_data']

        # Negative max means unlimited seeds are allowed, so don't do anything
        if max_seeds < 0: 
            return 

        torrentmanager = component.get("TorrentManager")
        torrent_ids = torrentmanager.get_torrent_list()

        log.debug("Number of torrents: {0}".format(len(torrent_ids)))
                  
        # If there are less torrents present than we allow then there can be nothing to do 
        if len(torrent_ids) <= max_seeds: 
            return 
        
        torrents = []
        ignored_torrents = []

        # relevant torrents to us exist and are finished 
        for i in torrent_ids: 
            t = torrentmanager.torrents.get(i, None)

            try:
                finished = t.is_finished
            except: 
                continue
            else: 
                if not finished: 
                    continue

            try: 
                ignored = self.torrent_states[i]
            except KeyError:
                ignored = False

            (ignored_torrents if ignored else torrents).append((i, t))

        log.debug("Number of finished torrents: {0}".format(len(torrents)))
        log.debug("Number of ignored torrents: {0}".format(len(ignored_torrents)))
        

        # now that we have trimmed active torrents check again to make sure we still need to proceed
        if len(torrents) + (len(ignored_torrents) if count_exempt else 0) <= max_seeds: 
            return 

        # if we are counting ignored torrents towards our maximum then these have to come off the top of our allowance
        if count_exempt: 
            max_seeds -= len(ignored_torrents)
            if max_seeds < 0: max_seeds = 0 
        
        # sort it according to our chosen method 
        torrents.sort(key = filter_funcs.get(self.config['filter'], _get_ratio), reverse = False)

        changed = False
        # remove these torrents
        for i, t in torrents[max_seeds:]: 
            log.debug("AutoRemove: Remove torrent %s, %s" % (i, t.get_status(['name'])['name']))
            if live: 
                try:
                    torrentmanager.remove(i, remove_data = remove_data)
                except Exception, e: 
                    log.warn("AutoRemove: Problems removing torrent: %s", e)

                try: 
                    del self.torrent_states.config[i] 
                except KeyError: 
                    pass
                else: 
                    changed = True

        if changed: 
            self.torrent_states.save()
         
