/*
Script: autoremoveplus.js
    The client-side javascript code for the AutoRemove plugin.

Copyright:
    (C) 2014 Omar Alvarez <osurfer3@hotmail.com>
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3, or (at your option)
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, write to:
        The Free Software Foundation, Inc.,
        51 Franklin Street, Fifth Floor
        Boston, MA  02110-1301, USA.

    In addition, as a special exception, the copyright holders give
    permission to link the code of portions of this program with the OpenSSL
    library.
    You must obey the GNU General Public License in all respects for all of
    the code used other than OpenSSL. If you modify file(s) with this
    exception, you may extend this exception to your version of the file(s),
    but you are not obligated to do so. If you do not wish to do so, delete
    this exception statement from your version. If you delete this exception
    statement from all source files in the program, then also delete it here.
*/

Ext.namespace('Deluge.plugins.autoremoveplus.ui');
Ext.namespace('Deluge.plugins.autoremoveplus.util');

if (typeof(console) === 'undefined') {
  console = {
    log: function() {}
  };
}

Deluge.plugins.autoremoveplus.PLUGIN_NAME = 'AutoRemovePlus';
Deluge.plugins.autoremoveplus.MODULE_NAME = 'autoremoveplus';
Deluge.plugins.autoremoveplus.DISPLAY_NAME = _('AutoRemovePlus');

Deluge.plugins.autoremoveplus.util.arrayEquals = function(a, b) {
    if (a.length != b.length) 
        return false;
    for (var i = 0; i < b.length; i++)
        if (a[i] !== b[i]) 
            return false;
    return true;
};


Deluge.plugins.autoremoveplus.ui.PreferencePage = Ext.extend(Ext.Panel, {

    title: Deluge.plugins.autoremoveplus.DISPLAY_NAME,

    layout: {
    type: 'vbox',
    align: 'stretch'
    },

    //layout: 'form',

    initComponent: function() {
        Deluge.plugins.autoremoveplus.ui.PreferencePage.superclass.initComponent.call(
          this);

        this.maxSeedsContainer = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '0 5 8 5',
            items: [{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Max. Seeded Torrents: ')
            },{
                xtype: 'spinnerfield',
                //anchor: '20%',
                //margins: '0 0 0 0',
                name: 'maxseedtorrents',
                fieldLabel: _('Maximum Seeded Torrents'),
                value: -1,
                maxValue: 9999,
                minValue: -1,
                flex: 0.45
            }, {
                xtype: 'label',
                margins: '5 0 0 5',
                text: _('(-1 for infinite)')
            }]
        });

        this.removeByContainer = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '0 5 8 5',
            items: [{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Remove by: ')
            },{
                xtype: 'combo',
                margins: '0 8 0 0',
                mode: 'local',
                store: [
                    [0, 'Ratio'],
                    [1, 'Date Added']
                ],
                value: 1,
                editable: true,
                triggerAction: 'all',
                boxMaxWidth: 20
                //flex: 0.1
                }
            ]
        });

        this.labelExTrackers = this.add({
          xtype: 'label',
          margins: '5 0 0 5',
          text: _('Exempted Trackers:')
        });

        this.tblTrackers = this.add({
            xtype: 'editorgrid',
            margins: '2 0 0 5',
            flex: 1,
            autoExpandColumn: 'name',

            viewConfig: {
                emptyText: _('Add a tracker to exempt...'),
                deferEmptyText: false
            },

            colModel: new Ext.grid.ColumnModel({
                columns: [{
                    id: 'name',
                    header: _('Name'),
                    dataIndex: 'name',
                    sortable: true,
                    hideable: false
                }]
            }),

            store: new Ext.data.ArrayStore({
                autoDestroy: true,
                fields: [{name: 'name'}]
            }),

            listeners: {
                //beforeedit: function(e) {
                 //   return e.record.get('enabled');
                //},

                afteredit: function(e) {
                    e.record.commit();
                }

            },

            loadData: function(data) {
                this.getStore().loadData(data);
                if (this.viewReady) {
                  this.getView().updateHeaders();
                }
            }

        });

        this.trackerButtonsContainer = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '4 0 0 5',
            items: [{
                xtype: 'button',
                text: ' Add Tracker ',
                margins: '0 5 0 0' 
            }, {
                xtype: 'button',
                text: ' Delete Tracker '
            }]
        });

        this.chkExemptCount = this.add({
          xtype: 'checkbox',
          margins: '5 0 0 5',
          boxLabel: _('Exempted torrents count toward maximum')
        });

        this.chkRemoveData = this.add({
          xtype: 'checkbox',
          margins: '5 0 0 5',
          boxLabel: _('Remove torrent data')
        });

        this.trackerButtonsContainer.getComponent(0).setHandler(this.addTracker, this);
        this.trackerButtonsContainer.getComponent(1).setHandler(this.deleteTracker, this);

        deluge.preferences.on('show', this.loadPrefs, this);
        deluge.preferences.buttons[1].on('click', this.savePrefs, this);
        deluge.preferences.buttons[2].on('click', this.savePrefs, this);

    },

    //TODO destroy

    addTracker: function() {},
    deleteTracker: function() {},

    loadPrefs: function() {
        if (deluge.preferences.isVisible()) {
          this._loadPrefs1();
        }
    },

    _loadPrefs1: function() {
        deluge.client.autoremoveplus.get_config({
          success: function(prefs) {
            this.preferences = prefs;
            this.chkExemptCount.setValue(prefs['count_exempt']);
            this.chkRemoveData.setValue(prefs['remove_data']);
            this.loadTrackers(prefs['trackers']);
            this.maxSeedsContainer.getComponent(1).setValue(prefs['max_seeds']);

            var removeBy = this.removeByContainer.getComponent(1);
            if(prefs['filter'] == 'func_ratio') 
                removeBy.setValue(0);
            else
                removeBy.setValue(1);
          },
          scope: this
        });
    },

    loadTrackers: function(trackers) {
        var store = this.tblTrackers.getStore();

        var data = [];
        var keys = Ext.keys(trackers).sort();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            data.push([trackers[key]]);
        }

        this.tblTrackers.loadData(data);
    },

    savePrefs: function() {
        var trackerList = [];
        var store = this.tblTrackers.getStore();
        var apply = false;

        for (var i = 0; i < store.getCount(); i++) {
          var record = store.getAt(i);
          var name = record.get('name');
          trackerList.push(name);
        }

        if(this.removeByContainer.getComponent(1).getValue() == 0)
            var filterVal = 'func_ratio';
        else
            var filterVal = 'func_added';

        var prefs = {
          remove_data: this.chkRemoveData.getValue(),
          count_exempt: this.chkExemptCount.getValue(),
          trackers: trackerList,
          max_seeds: this.maxSeedsContainer.getComponent(1).getValue(),
          filter: filterVal
        };

        apply |= prefs['remove_data'] != this.preferences['remove_data'];
        apply |= prefs['count_exempt'] != this.preferences['count_exempt'];
        apply |= prefs['max_seeds'] != this.preferences['max_seeds'];
        apply |= prefs['filter'] != this.preferences['filter'];
        apply |= !Deluge.plugins.autoremoveplus.util.arrayEquals(prefs['trackers'],
            this.preferences['trackers']);

        if (apply) {
          deluge.client.autoremoveplus.set_config(prefs, {
            success: this.loadPrefs,
            scope: this
          });
        }
    }   

});

Deluge.plugins.autoremoveplus.Plugin = Ext.extend(Deluge.Plugin, {

    name: Deluge.plugins.autoremoveplus.PLUGIN_NAME,

    onEnable: function() {
        this.prefsPage = new Deluge.plugins.autoremoveplus.ui.PreferencePage();
        deluge.preferences.addPage(this.prefsPage);

        console.log('Enabling autoremoveplus...');

        deluge.menus.torrent.add([{
            xtype: 'menucheckitem',
            text: 'AutoRemovePlus Exempt'
        }]);
        //console.log('%s enabled', Deluge.plugins.ltconfig.PLUGIN_NAME);
    },

    onDisable: function() {
        //deluge.preferences.selectPage(_('Plugins'));
        //deluge.preferences.removePage(this.prefsPage);
        //this.prefsPage.destroy();

        console.log('%s disabled', Deluge.plugins.autoremoveplus.PLUGIN_NAME);
    }
});

Deluge.registerPlugin(Deluge.plugins.autoremoveplus.PLUGIN_NAME,Deluge.plugins.autoremoveplus.Plugin);
