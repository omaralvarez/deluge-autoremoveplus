#
# gtkui.py
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

import gtk

from deluge.log import LOG as log
from deluge.ui.client import client
from deluge.plugins.pluginbase import GtkPluginBase
import deluge.component as component
import deluge.common

from common import get_resource

class GtkUI(GtkPluginBase):
    
    def enable(self):
        self.glade = gtk.glade.XML(get_resource("config.glade"))
        component.get("Preferences").add_page("AutoRemove", self.glade.get_widget("prefs_box"))
        component.get("PluginManager").register_hook("on_apply_prefs", self.on_apply_prefs)
        component.get("PluginManager").register_hook("on_show_prefs", self.on_show_prefs)

        self.rules = gtk.ListStore(str, str)
        client.autoremove.get_remove_rules().addCallback(self.cb_get_rules)

        cell = gtk.CellRendererText()
        
        cbo_remove = self.glade.get_widget("cbo_remove")
        cbo_remove.pack_start(cell, True)
        cbo_remove.add_attribute(cell, 'text', 1)
        cbo_remove.set_model(self.rules)

        def on_menu_show(menu, (menu_item, toggled)): 
            def set_ignored(ignored): 
                # set_active will raise the 'toggled'/'activated' signals so block it to not reset the value
                menu_item.handler_block (toggled)
                menu_item.set_active(False not in ignored) 
                menu_item.handler_unblock (toggled)

            client.autoremove.get_ignore([t for t in component.get("TorrentView").get_selected_torrents() ]).addCallback(set_ignored)    

        def on_menu_toggled(menu):
            client.autoremove.set_ignore(component.get("TorrentView").get_selected_torrents(), menu.get_active())

        self.menu = gtk.CheckMenuItem(_("AutoRemove Exempt"))
        self.menu.show()

        toggled = self.menu.connect('toggled', on_menu_toggled)

        torrentmenu = component.get("MenuBar").torrentmenu
        self.show_sig = torrentmenu.connect('show', on_menu_show, (self.menu, toggled))
        torrentmenu.append(self.menu)

        self.on_show_prefs()

    def disable(self):
        component.get("Preferences").remove_page("AutoRemove")
        component.get("PluginManager").deregister_hook("on_apply_prefs", self.on_apply_prefs)
        component.get("PluginManager").deregister_hook("on_show_prefs", self.on_show_prefs)

        torrentmenu = component.get("MenuBar").torrentmenu
        torrentmenu.remove(self.menu)
        torrentmenu.disconnect(self.show_sig) 

        del self.rules
        del self.menu 
        del self.show_sig 

    def on_apply_prefs(self):
        log.debug("applying prefs for AutoRemove")

        c = self.glade.get_widget("cbo_remove")

        config = {
            "max_seeds" : self.glade.get_widget("spn_seeds").get_value_as_int(),
            'filter' : c.get_model()[c.get_active_iter()][0],
            'count_exempt' : self.glade.get_widget('chk_count').get_active()
        }

        client.autoremove.set_config(config)

    def on_show_prefs(self):
        client.autoremove.get_config().addCallback(self.cb_get_config)

    def cb_get_rules(self, rules): 
        self.rules.clear() 

        for k, v in rules.iteritems(): 
            self.rules.append((k,v))

    def cb_get_config(self, config):
        self.glade.get_widget("spn_seeds").set_value(config["max_seeds"])
        self.glade.get_widget("chk_count").set_active(config['count_exempt'])

        selected = config['filter']

        for i, row in enumerate(self.rules): 
            if row[0] == selected: 
                self.glade.get_widget("cbo_remove").set_active(i) 
                break
        else:
            self.glade.get_widget("cbo_remove").set_active(0)

