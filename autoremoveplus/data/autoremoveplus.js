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

        this.numfMST = this.add({
            xtype: 'spinnerfield',
            //anchor: '100%',
            //margins: '0 0 0 0',
            name: 'maxseedtorrents',
            fieldLabel: _('Maximum Seeded Torrents'),
            value: -1,
            maxValue: 9999,
            minValue: -1
        });

        this.chkExemptCount = this.add({
          xtype: 'checkbox',
          margins: '0 0 0 0',
          boxLabel: _('Exempted torrents count toward maximum')
        });

        this.chkRemoveData = this.add({
          xtype: 'checkbox',
          margins: '0 0 0 0',
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
