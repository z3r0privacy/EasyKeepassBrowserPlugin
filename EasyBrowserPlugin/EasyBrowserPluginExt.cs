﻿using EasyBrowserPlugin.UI;
using KeePass.Forms;
using KeePass.Plugins;
using KeePassLib;
using KeePassLib.Security;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EasyBrowserPlugin
{
    public class EasyBrowserPluginExt : Plugin
    {
        private IPluginHost _pHost;
        private HTTPHandler _handler;

        private const string SAVED_KEY_NAME = "EasyBrowserAddonKey";

        private Configuration _config;

        internal byte[] CryptoKey { get; private set; }
        public override bool Initialize(IPluginHost host)
        {
            //Debugger.Launch();
            _pHost = host;
            host.MainWindow.FileOpened += CheckPluginKeyState;
            _config = new Configuration(host);
            _handler = new HTTPHandler(host, this, _config);
            _handler.Start();
            return true;
        }

        private void CheckPluginKeyState(object sender, FileOpenedEventArgs e)
        {
            var rootEntries = e.Database.RootGroup.GetEntries(false);
            foreach (var entry in rootEntries)
            {
                if (entry.Strings.ReadSafe(PwDefs.TitleField).Equals(SAVED_KEY_NAME, StringComparison.OrdinalIgnoreCase)) {
                    CryptoKey = Convert.FromBase64String(entry.Strings.ReadSafe(PwDefs.PasswordField));
                    return;
                }
            }
            var newEntry = new PwEntry(true, true);
            var key = CryptoHelper.CreateAESKey();
            newEntry.Strings.Set(PwDefs.TitleField, new ProtectedString(false, SAVED_KEY_NAME));
            newEntry.Strings.Set(PwDefs.PasswordField, new ProtectedString(true, key));
            e.Database.RootGroup.AddEntry(newEntry, true, true);

            CryptoKey = Convert.FromBase64String(key);

            _pHost.MainWindow.UpdateUI(false, null, false, null, true, e.Database.RootGroup, true);
        }

        public override ToolStripMenuItem GetMenuItem(PluginMenuType t)
        {
            if (t == PluginMenuType.Main)
            {
                var main = new ToolStripMenuItem()
                {
                    Text = "EasyBroswerAddon"
                };

                var mi = new ToolStripMenuItem()
                {
                    Text = "Setup EasyBrowserAddon"
                };
                mi.Click += OpenAddonSetupWindow;
                main.DropDownItems.Add(mi);

                var configUI = new ToolStripMenuItem()
                {
                    Text = "Options"
                };
                configUI.Click += ConfigUI_Click;
                main.DropDownItems.Add(configUI);

#if __DEBUG
                var dl = new ToolStripMenuItem()
                {
                    Text = "Launch Debugger"
                };
                dl.Click += (s, e) => Debugger.Launch();

                main.DropDownItems.Add(dl);
#endif

                return main;
            }
            return null;
        }

        private void ConfigUI_Click(object sender, EventArgs e)
        {
            var wnd = new ConfigDialog();
            wnd.ShowDialog();
        }

        private void OpenAddonSetupWindow(object sender, EventArgs e)
        {
            if (_pHost.Database.IsOpen)
            {
                var vm = new SetupDialogViewModel()
                {
                    Key = Convert.ToBase64String(CryptoKey)
                };
                var wnd = new SetupDialog(vm); // new AddonSetupWindow(this);
                wnd.ShowDialog();
            } else
            {
                MessageBox.Show("A database needs to be opened and unlocked to do this.", "Database not unlocked", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public override void Terminate()
        {
            _handler.Stop();
            _pHost.MainWindow.FileOpened -= CheckPluginKeyState;
        }
    }
}
