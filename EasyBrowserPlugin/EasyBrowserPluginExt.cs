using KeePass.Plugins;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin
{
    public class EasyBrowserPluginExt : Plugin
    {
        private HTTPHandler _handler;
        public override bool Initialize(IPluginHost host)
        {
            Debugger.Launch();
            _handler = new HTTPHandler(host);
            _handler.Start();
            return true;
        }

        public override void Terminate()
        {
            _handler.Stop();
        }
    }
}
