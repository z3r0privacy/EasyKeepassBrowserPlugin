using KeePass.Plugins;
using KeePassLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin.Shared
{
    public class Configuration
    {
        public enum SelectionMode
        {
            All, AllExcept, Only, None
        }
        public List<PwUuid> SelectedGroups { get; }
        public SelectionMode Mode { get; set; }

        private IPluginHost _host;

        public Configuration(IPluginHost plugin)
        {
            Mode = (SelectionMode)plugin.CustomConfig.GetULong("Mode", (ulong)SelectionMode.All);
            SelectedGroups = new List<PwUuid>();
            SelectedGroups.AddRange(plugin.CustomConfig.GetString("Groups", null)?.Split(';').Select(s => Convert.FromBase64String(s)).Select(b => new PwUuid(b)) ?? new PwUuid[0]);
            _host = plugin;

        }

        public void Save()
        {
            _host.CustomConfig.SetULong("Mode", (ulong)Mode);
            if (SelectedGroups.Count == 0)
            {
                _host.CustomConfig.SetString("Groups", null);
            } else
            {
                _host.CustomConfig.SetString("Groups", SelectedGroups
                    .Select(g => Convert.ToBase64String(g.UuidBytes))
                    .Aggregate((s1, s2) => s1 + ";" + s2));
            }
            _host.MainWindow.SaveConfig();
        }
    }
}
