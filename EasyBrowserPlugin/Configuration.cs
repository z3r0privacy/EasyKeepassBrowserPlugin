using KeePass.Plugins;
using KeePassLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin
{
    public class Configuration
    {
        public enum SelectionMode
        {
            All, AllExcept, Only, None
        }
        public List<PwUuid> EnabledGroups { get; }
        public SelectionMode Mode { get; set; }

        private IPluginHost _host;

        public Configuration(IPluginHost plugin)
        {
            Mode = (SelectionMode)plugin.CustomConfig.GetULong("Mode", (ulong)SelectionMode.All);
            EnabledGroups = new List<PwUuid>();
            EnabledGroups.AddRange(plugin.CustomConfig.GetString("Groups", null)?.Split(';').Select(s => Convert.FromBase64String(s)).Select(b => new PwUuid(b)) ?? new PwUuid[0]);
            _host = plugin;

        }
    }
}
