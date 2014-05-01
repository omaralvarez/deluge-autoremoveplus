/*
Script: autoremove.js
    The client-side javascript code for the AutoRemove plugin.

Copyright:
    (C) Jamie Lennox 2011 <jamielennox@gmail.com>
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
//Ext.namespace('Deluge.menus.torrent');

if (typeof(console) === 'undefined') {
  console = {
    log: function() {}
  };
}

Deluge.plugins.autoremoveplus.PLUGIN_NAME = 'AutoRemovePlus';
Deluge.plugins.autoremoveplus.MODULE_NAME = 'autoremoveplus';
Deluge.plugins.autoremoveplus.DISPLAY_NAME = _('AutoRemovePlus');

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
                value: 0,
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
            margins: '2 0 0 0',
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
            }

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
