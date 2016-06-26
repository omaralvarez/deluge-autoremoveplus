/*
Script: autoremoveplus.js
    The client-side javascript code for the AutoRemove plugin.

Copyright:
    (C) 2014-2016 Omar Alvarez <osurfer3@hotmail.com>
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

        this.chkEnabled = this.add({
          xtype: 'checkbox',
          margins: '0 0 0 5',
          boxLabel: _('Enable')
        });

        this.intervalContainer = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '5 5 8 5',
            items: [{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Check every: ')
            },{
                xtype: 'spinnerfield',
                //anchor: '20%',
                //margins: '0 0 0 0',
                name: 'checkInterval',
                fieldLabel: _('Check every'),
                value: 1.0,
                maxValue: 1000.0,
                minValue: 0.0001,
                allowDecimals: true,
                decimalPrecision: 4,
                incrementValue: 0.1,
                alternateIncrementValue: 0.5,
                flex: 0.2
            }]
        });

        this.maxSeedsContainer = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '0 5 8 5',
            items: [{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Max. Torrents: ')
            },{
                xtype: 'spinnerfield',
                //anchor: '20%',
                //margins: '0 0 0 0',
                name: 'maxseedtorrents',
                fieldLabel: _('Maximum Torrents'),
                value: 0,
                maxValue: 9999,
                minValue: 0,
                flex: 0.45
            }]
        });

        this.minHDDSpaceContainer = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '0 5 8 5',
            items: [{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Min. HDD Space: ')
            },{
                xtype: 'spinnerfield',
                name: 'minHDDSpace',
                fieldLabel: _('Min. HDD Space'),
                value: -1.0,
                maxValue: 10000.0,
                minValue: -1.0,
                allowDecimals: true,
                decimalPrecision: 3,
                incrementValue: 0.5,
                alternateIncrementValue: 1.0,
                flex: 0.45
            }, {
                xtype: 'label',
                margins: '5 0 0 5',
                text: _('GB (-1 for infinite)')
            }]
        });

        this.removeByContainer = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '0 5 8 5',
            items: [{
                xtype: 'combo',
                margins: '0 8 0 0',
                mode: 'local',
                valueField: 'func_id',
                displayField: 'func_name',
                //value: 0,
                editable: false,
                disabled: true,
                triggerAction: 'all',
               // autoWidth: true,
                //boxMaxWidth: 20,
                flex: 0.22
            },{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Remove by: ')
            },{
                xtype: 'combo',
                margins: '0 8 0 0',
                mode: 'local',
                store: new Ext.data.ArrayStore({
	                autoDestroy: true,
	                idIndex: 0,
	                fields: ['func_id','func_name']
            	}),
            	valueField: 'func_id',
    			displayField: 'func_name',
                //value: 0,
                editable: true,
                triggerAction: 'all',
               // autoWidth: true,
                //boxMaxWidth: 20,
                flex: 0.45
            },{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Min: ')
            },{
                xtype: 'spinnerfield',
                //anchor: '20%',
                //margins: '0 0 0 0',
                name: 'min',
                fieldLabel: _('Min'),
                value: 0.0,
                maxValue: 10000.0,
                minValue: 0.0,
                allowDecimals: true,
                decimalPrecision: 3,
                incrementValue: 0.5,
                alternateIncrementValue: 1.0,
                flex: 0.35
            }]
        });

        this.removeByContainer2 = this.add({
            xtype: 'container',
            layout: 'hbox',
            margins: '0 5 8 5',
            items: [{
                xtype: 'combo',
                margins: '0 8 0 0',
                mode: 'local',
                store: [
                    'and',
                    'or'
                ],
                //valueField: 'func_id',
                //displayField: 'func_name',
                value: 0,
                editable: true,
                triggerAction: 'all',
               // autoWidth: true,
                //boxMaxWidth: 20,
                flex: 0.22
            },{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Remove by: ')
            },{
                xtype: 'combo',
                margins: '0 8 0 0',
                mode: 'local',
                store: new Ext.data.ArrayStore({
                    autoDestroy: true,
                    idIndex: 0,
                    fields: ['func_id','func_name']
                }),
                valueField: 'func_id',
                displayField: 'func_name',
                //value: 0,
                editable: true,
                triggerAction: 'all',
               // autoWidth: true,
                //boxMaxWidth: 20,
                flex: 0.45
            },{
                xtype: 'label',
                margins: '5 5 0 0',
                text: _('Min: ')
            },{
                xtype: 'spinnerfield',
                //anchor: '20%',
                //margins: '0 0 0 0',
                name: 'min2',
                fieldLabel: _('Min'),
                value: 0.0,
                maxValue: 10000.0,
                minValue: 0.0,
                allowDecimals: true,
                decimalPrecision: 3,
                incrementValue: 0.5,
                alternateIncrementValue: 1.0,
                flex: 0.35
            }]
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
                    id: 'type',
                    header: _('Type'),
                    dataIndex: 'type',
                    sortable: true,
                    hideable: false,
                    editable: true,
                    editor: {
                      xtype: 'combo',
                      store: ['Tracker','Label']
                    }
                },{
                    id: 'name',
                    header: _('Name'),
                    dataIndex: 'name',
                    sortable: true,
                    hideable: false,
                    editable: true,
                    editor: {
                      xtype: 'textfield'
                    }
                }]
            }),

            selModel: new Ext.grid.RowSelectionModel({
                singleSelect: false,
                moveEditorOnEnter: false
            }),

            store: new Ext.data.ArrayStore({
                autoDestroy: true,
                fields: [
                  {name: 'type'},
                  {name: 'name'}
                ]
            }),

            listeners: {
                afteredit: function(e) {
                    e.record.commit();
                }
            },

            setEmptyText: function(text) {
                if (this.viewReady) {
                  this.getView().emptyText = text;
                  this.getView().refresh();
                } else {
                  Ext.apply(this.viewConfig, {emptyText: text});
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

        this.chkRemove = this.add({
          xtype: 'checkbox',
          margins: '5 0 0 5',
          boxLabel: _('Remove torrents')
        });

        this.chkRemoveData = this.add({
          xtype: 'checkbox',
          margins: '5 0 0 5',
          boxLabel: _('Remove torrent data')
        });

        this.trackerButtonsContainer.getComponent(0).setHandler(this.addTracker, this);
        this.trackerButtonsContainer.getComponent(1).setHandler(this.deleteTracker, this);

        this.chkRemove.on('check', this.onClickRemove, this);
        this.chkEnabled.on('check', this.onClickEnabled, this);

        deluge.preferences.on('show', this.loadPrefs, this);
        deluge.preferences.buttons[1].on('click', this.savePrefs, this);
        deluge.preferences.buttons[2].on('click', this.savePrefs, this);

        this.waitForClient(10);
    },

    //TODO destroy
    onDestroy: function() {
        this.un('check', this.onClickRemove, this);
        this.un('check', this.onClickEnabled, this);
        deluge.preferences.un('show', this.loadPrefs, this);
        deluge.preferences.buttons[1].un('click', this.savePrefs, this);
        deluge.preferences.buttons[2].un('click', this.savePrefs, this);

        Deluge.plugins.autoremoveplus.ui.PreferencePage.superclass.onDestroy.call(this);
    },

    waitForClient: function(triesLeft) {
        if (triesLeft < 1) {
          this.tblTrackers.setEmptyText(_('Unable to load settings'));
          return;
        }

        if (deluge.login.isVisible() || !deluge.client.core ||
            !deluge.client.autoremoveplus) {
          var self = this;
          var t = deluge.login.isVisible() ? triesLeft : triesLeft-1;
          setTimeout(function() { self.waitForClient.apply(self, [t]); }, 1000);
        } else if (!this.isDestroyed) {
          this.loadPrefs();
        }
    },

    addTracker: function() {
        // access the Record constructor through the grid's store
        var store = this.tblTrackers.getStore();
        var Tracker = store.recordType;
        var t = new Tracker({
            name: ''
        });
        this.tblTrackers.stopEditing();
        store.insert(0, t);
        this.tblTrackers.startEditing(0, 0);
    },

    deleteTracker: function() {
        var selections = this.tblTrackers.getSelectionModel().getSelections();
        var store = this.tblTrackers.getStore();

        this.tblTrackers.stopEditing();
        for (var i = 0; i < selections.length; i++)
            store.remove(selections[i]);
        store.commitChanges();
    },

    onClickRemove: function(checkbox, checked) {
        if (checked)
          this.chkRemoveData.enable();
        else
          this.chkRemoveData.disable();
          console.log(checked);
          console.log('onClickRemove');
    },

    enableAllWidgets: function() {

        this.intervalContainer.enable();
        this.maxSeedsContainer.enable();
        this.minHDDSpaceContainer.enable();
        this.removeByContainer.enable();
        this.removeByContainer2.enable();
        this.labelExTrackers.enable();
        this.tblTrackers.enable();
        this.trackerButtonsContainer.enable();
        this.chkExemptCount.enable();
        this.chkRemove.enable();
        if (this.chkRemove.getValue())
          this.chkRemoveData.enable();
        else
          this.chkRemoveData.disable();

    },

    disableAllWidgets: function() {

        this.intervalContainer.disable();
        this.maxSeedsContainer.disable();
        this.minHDDSpaceContainer.disable();
        this.removeByContainer.disable();
        this.removeByContainer2.disable();
        this.labelExTrackers.disable();
        this.tblTrackers.disable();
        this.trackerButtonsContainer.disable();
        this.chkExemptCount.disable();
        this.chkRemove.disable();
        this.chkRemoveData.disable();

    },

    onClickEnabled: function(checkbox, checked) {
        if (checked)
          this.enableAllWidgets();
        else
          this.disableAllWidgets();
          //console.log(checked);
          //console.log('onClickRemove');
    },

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
            this.loadExemptions(prefs['trackers'], prefs['labels']);
            this.intervalContainer.getComponent(1).setValue(prefs['interval']);
            this.maxSeedsContainer.getComponent(1).setValue(prefs['max_seeds']);
            this.minHDDSpaceContainer.getComponent(1).setValue(prefs['hdd_space']);
            this.removeByContainer.getComponent(4).setValue(prefs['min']);
            this.removeByContainer2.getComponent(4).setValue(prefs['min2']);
            this.removeByContainer2.getComponent(0).setValue(prefs['sel_func']);
            this.chkRemove.setValue(prefs['remove']);
            var enabled = prefs['enabled'];
            this.chkEnabled.setValue(enabled);
            if(enabled)
              this.enableAllWidgets();
            else
              this.disableAllWidgets();
          },
          scope: this
        });

        deluge.client.autoremoveplus.get_remove_rules({
          success: function(rules) {
          	var data = [];
          	var removeBy = this.removeByContainer.getComponent(2);
            var removeBy2 = this.removeByContainer2.getComponent(2);
            var removeByStore = removeBy.getStore();
            var removeByStore2 = removeBy2.getStore();
            var keys = Ext.keys(rules);
            for (var i = 0; i < keys.length; i++) {
	            var key = keys[i];
	            data.push([key,rules[key]]);
	            //console.log([key,rules[key]]);
	        }
            removeByStore.loadData(data);
            removeBy.setValue(this.preferences['filter']);
            removeByStore2.loadData(data);
            removeBy2.setValue(this.preferences['filter2']);
          },
          scope: this
        });

    },

    loadExemptions: function(trackers, labels) {
        var store = this.tblTrackers.getStore();

        var data = [];

        var keys = Ext.keys(trackers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            data.push(['Tracker',trackers[key]]);
        }

        keys = Ext.keys(labels);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            data.push(['Label',labels[key]]);
        }

        this.tblTrackers.loadData(data);
    },

    savePrefs: function() {
        var trackerList = [];
        var labelList = [];
        var store = this.tblTrackers.getStore();
        var apply = false;

        for (var i = 0; i < store.getCount(); i++) {
          var record = store.getAt(i);
          var type = record.get('type');
          var name = record.get('name');
          if(!type.localeCompare('Tracker'))
            trackerList.push(name);
          else
            labelList.push(name);
        }

        var filterVal = this.removeByContainer.getComponent(2).getValue();
        var filterVal2 = this.removeByContainer2.getComponent(2).getValue();

        var prefs = {
          remove_data: this.chkRemoveData.getValue(),
          count_exempt: this.chkExemptCount.getValue(),
          trackers: trackerList,
          labels: labelList,
          max_seeds: this.maxSeedsContainer.getComponent(1).getValue(),
          hdd_space: this.minHDDSpaceContainer.getComponent(1).getValue(),
          filter: filterVal,
          filter2: filterVal2,
          min: this.removeByContainer.getComponent(4).getValue(),
          min2: this.removeByContainer2.getComponent(4).getValue(),
          sel_func: this.removeByContainer2.getComponent(0).getValue(),
          interval: this.intervalContainer.getComponent(1).getValue(),
          remove: this.chkRemove.getValue(),
          enabled: this.chkEnabled.getValue()
        };

        apply |= prefs['remove_data'] != this.preferences['remove_data'];
        apply |= prefs['count_exempt'] != this.preferences['count_exempt'];
        apply |= prefs['max_seeds'] != this.preferences['max_seeds'];
        apply |= prefs['hdd_space'] != this.preferences['hdd_space'];
        apply |= prefs['filter'] != this.preferences['filter'];
        apply |= prefs['filter2'] != this.preferences['filter2'];
        apply |= prefs['min'] != this.preferences['min'];
        apply |= prefs['min2'] != this.preferences['min2'];
        apply |= prefs['sel_func'] != this.preferences['sel_func'];
        apply |= prefs['interval'] != this.preferences['interval'];
        apply |= prefs['remove'] != this.preferences['remove'];
        apply |= prefs['enabled'] != this.preferences['enabled'];
        apply |= !Deluge.plugins.autoremoveplus.util.arrayEquals(prefs['trackers'],
            this.preferences['trackers']);
        apply |= !Deluge.plugins.autoremoveplus.util.arrayEquals(prefs['labels'],
            this.preferences['labels']);

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

        deluge.menus.torrent.add([{
            xtype: 'menucheckitem',
            text: 'AutoRemovePlus Exempt',
            id: 'exempt',

            listeners: {
                checkchange: function(checkitem,checked) {
                    //console.log('Torrent checked...');
                    console.log(checked);
                    deluge.client.autoremoveplus.set_ignore(deluge.torrents.getSelectedIds(),checked);
                }
            }
        }]);

		deluge.menus.torrent.on('show', this.updateExempt, this);

        console.log('%s enabled', Deluge.plugins.autoremoveplus.PLUGIN_NAME);
    },

    onDisable: function() {
        deluge.preferences.selectPage(_('Plugins'));
        deluge.preferences.removePage(this.prefsPage);
        this.prefsPage.destroy();

        deluge.menus.torrent.un('show', this.updateExempt, this);

        console.log('%s disabled', Deluge.plugins.autoremoveplus.PLUGIN_NAME);
    },

    //TODO block setChecked signal
    updateExempt: function() {
    	console.log('Updating checkitem...');
    	var checkitem = deluge.menus.torrent.getComponent('exempt');
    	deluge.client.autoremoveplus.get_ignore(deluge.torrents.getSelectedIds(), {
            success: function(ignored) {
                var checked = ignored.indexOf(false) < 0;
                checkitem.setChecked(checked);
            },
            scope: this
        });
    }

});

Deluge.registerPlugin(Deluge.plugins.autoremoveplus.PLUGIN_NAME,Deluge.plugins.autoremoveplus.Plugin);
