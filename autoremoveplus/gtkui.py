#
# gtkui.py
#
# Copyright (C) 2014 Omar Alvarez <osurfer3@hotmail.com>
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
        log.debug("Enabling AutoRemovePlus...")
        self.glade = gtk.glade.XML(get_resource("config.glade"))
        component.get("Preferences").add_page("AutoRemovePlus", self.glade.get_widget("prefs_box"))
        component.get("PluginManager").register_hook("on_apply_prefs", self.on_apply_prefs)
        component.get("PluginManager").register_hook("on_show_prefs", self.on_show_prefs)

        # Create and fill remove rule list
        self.rules = gtk.ListStore(str, str)
        client.autoremoveplus.get_remove_rules().addCallback(self.cb_get_rules)

        # Fill list with logical functions
        self.sel_func_store = gtk.ListStore(str)
        self.sel_func_store.append(["and"])
        self.sel_func_store.append(["or"])

        cell = gtk.CellRendererText()

        cbo_remove = self.glade.get_widget("cbo_remove")
        cbo_remove.pack_start(cell, True)
        cbo_remove.add_attribute(cell, 'text', 1)
        cbo_remove.set_model(self.rules)

        cbo_remove1 = self.glade.get_widget("cbo_remove1")
        cbo_remove1.pack_start(cell, True)
        cbo_remove1.add_attribute(cell, 'text', 1)
        cbo_remove1.set_model(self.rules)

        cbo_sel_func = self.glade.get_widget("cbo_sel_func")
        cbo_sel_func.set_model(self.sel_func_store)
        cbo_sel_func.set_active(0)
        self.glade.get_widget("dummy").set_model(self.sel_func_store)

        self._new_tracker = self.glade.get_widget("new_tracker")
        self._new_tracker.connect("clicked", self._do_new_tracker)
        self._delete_tracker = self.glade.get_widget("delete_tracker")
        self._delete_tracker.connect("clicked", self._do_delete_tracker)

        self._blk_trackers = self.glade.get_widget("blk_trackers")
        self._view = self._build_view()
        window = gtk.ScrolledWindow()
        window.set_policy(gtk.POLICY_AUTOMATIC, gtk.POLICY_AUTOMATIC)
        window.set_shadow_type(gtk.SHADOW_IN)
        window.add(self._view)
        self._blk_trackers.add(window)
        self._blk_trackers.show_all()

        self.glade.get_widget("chk_remove").connect("toggled", self.on_click_remove)

        def on_menu_show(menu, (menu_item, toggled)):
            def set_ignored(ignored):
                # set_active will raise the 'toggled'/'activated' signals
                # so block it to not reset the value
                menu_item.handler_block(toggled)
                menu_item.set_active(False not in ignored)
                menu_item.handler_unblock(toggled)

            client.autoremoveplus.get_ignore([t for t in component.get("TorrentView").get_selected_torrents() ]).addCallback(set_ignored)

        def on_menu_toggled(menu):
            client.autoremoveplus.set_ignore(component.get("TorrentView").get_selected_torrents(), menu.get_active())

        self.menu = gtk.CheckMenuItem(_("AutoRemovePlus Exempt"))
        self.menu.show()

        toggled = self.menu.connect('toggled', on_menu_toggled)

        torrentmenu = component.get("MenuBar").torrentmenu
        self.show_sig = torrentmenu.connect('show', on_menu_show, (self.menu, toggled))
        self.realize_sig = torrentmenu.connect('realize', on_menu_show, (self.menu, toggled))
        torrentmenu.append(self.menu)

        self.on_show_prefs()

    def disable(self):
        component.get("Preferences").remove_page("AutoRemovePlus")
        component.get("PluginManager").deregister_hook("on_apply_prefs", self.on_apply_prefs)
        component.get("PluginManager").deregister_hook("on_show_prefs", self.on_show_prefs)

        torrentmenu = component.get("MenuBar").torrentmenu
        torrentmenu.remove(self.menu)
        torrentmenu.disconnect(self.show_sig)
        torrentmenu.disconnect(self.realize_sig)

        del self.rules
        del self.sel_func_store
        del self.menu
        del self.show_sig
        del self.realize_sig

    def on_click_remove(self,check):
        self.glade.get_widget("chk_remove_data").set_sensitive(check.get_active())

    def _do_new_tracker(self,button):
        new_row = self.lstore.append(["Tracker","New Tracker"])
        #self._view.set_cursor("3", start_editing=True)
        path = self.lstore.get_path(new_row)
        self._view.set_cursor(path, focus_column=self._view.get_column(1), start_editing=True)

    def _do_delete_tracker(self,button):
        selection = self._view.get_selection()
        model, paths = selection.get_selected_rows()

        for path in paths:
            iter = model.get_iter(path)
            model.remove(iter)

    def on_apply_prefs(self):
        log.debug("applying prefs for AutoRemovePlus")
        # log.debug("Min: %f" % (self.glade.get_widget("spn_min").get_value()))
        c = self.glade.get_widget("cbo_remove")
        c1 = self.glade.get_widget("cbo_remove1")

        trackers = []
        labels = []

        for row in self._view.get_model():
            if row[0] == "Tracker":
                trackers.append(row[1])
            else:
                labels.append(row[1])

        config = {
            "max_seeds": self.glade.get_widget("spn_seeds").get_value_as_int(),
            'filter': c.get_model()[c.get_active_iter()][0],
            'count_exempt': self.glade.get_widget('chk_count').get_active(),
            'remove_data': self.glade.get_widget('chk_remove_data').get_active(),
            'trackers': trackers,
            'labels': labels,
            'min': self.glade.get_widget("spn_min").get_value(),
            'interval': self.glade.get_widget("spn_interval").get_value(),
            'sel_func': self.glade.get_widget("cbo_sel_func").get_active_text(),
            'filter2': c1.get_model()[c1.get_active_iter()][0],
            'min2': self.glade.get_widget("spn_min1").get_value(),
            'hdd_space': self.glade.get_widget("spn_min2").get_value(),
            'remove': self.glade.get_widget('chk_remove').get_active()
        }

        client.autoremoveplus.set_config(config)

    def on_show_prefs(self):
        client.autoremoveplus.get_config().addCallback(self.cb_get_config)

    def cb_get_rules(self, rules):
        self.rules.clear()

        for k, v in rules.iteritems():
            self.rules.append((k, v))

    def cb_get_config(self, config):
        self.glade.get_widget("spn_seeds").set_value(config["max_seeds"])
        self.glade.get_widget("spn_min").set_value(config["min"])
        self.glade.get_widget("spn_min1").set_value(config["min2"])
        self.glade.get_widget("spn_min2").set_value(config["hdd_space"])
        self.glade.get_widget("chk_count").set_active(config['count_exempt'])
        self.glade.get_widget("chk_remove_data").set_active(config['remove_data'])
        self.glade.get_widget("spn_interval").set_value(config["interval"])
        self.glade.get_widget("chk_remove").set_active(config['remove'])

        self.lstore.clear()
        trackers = config['trackers']
        for tracker in trackers:
            self.lstore.append(["Tracker", tracker])

        labels = config['labels']
        for label in labels:
            self.lstore.append(["Label", label])

        selected = config['filter']

        for i, row in enumerate(self.rules):
            if row[0] == selected:
                self.glade.get_widget("cbo_remove").set_active(i)
                break
        else:
            self.glade.get_widget("cbo_remove").set_active(0)


        selected = config['filter2']

        for i, row in enumerate(self.rules):
            if row[0] == selected:
                self.glade.get_widget("cbo_remove1").set_active(i)
                break
        else:
            self.glade.get_widget("cbo_remove1").set_active(0)

        selected = config['sel_func']

        for i, row in enumerate(self.sel_func_store):

            if row[0] == selected:
                self.glade.get_widget("cbo_sel_func").set_active(i)
                break
        else:
            self.glade.get_widget("cbo_sel_func").set_active(0)

    def _build_view(self):

        self.lstore = gtk.ListStore(str, str)
        view = gtk.TreeView(model=self.lstore)

        # Create field to set the type of exemption
        liststore_field = gtk.ListStore(str)
        for item in ["Tracker", "Label"]:
            liststore_field.append([item])
        crc = gtk.CellRendererCombo()
        crc.set_property("editable", True)
        crc.set_property("model", liststore_field)
        crc.set_property("text-column", 0)
        crc.set_property("has-entry", False)
        crc.connect("edited", self._on_combo_changed)
        # crc.set_active(0)
        colc = gtk.TreeViewColumn(_("Type"), crc, text=0)
        view.append_column(colc)

        # Create text field for label or tracker names
        crt = gtk.CellRendererText()
        crt.set_property("editable", True)
        crt.connect("edited", self._text_edited)
        colt = gtk.TreeViewColumn(_("Name"), crt, text=1)
        view.append_column(colt)

        return view

    def _on_combo_changed(self, widget, path, text):
        self.lstore[path][0] = text

    def _text_edited(self, widget, path, text):
        self.lstore[path][1] = text
