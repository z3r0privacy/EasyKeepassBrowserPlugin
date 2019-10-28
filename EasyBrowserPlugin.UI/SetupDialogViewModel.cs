using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin.UI
{
    public class SetupDialogViewModel
    {
        public string HelpText { get; set; } = "Copy this value into the addon where requested.";
        public string Key { get; set; } = "8imVWZEmi3REMh5zPai2gGzMWa26xHglG28o12346oQ=";
        public string btnOkText { get; set; } = "Close";
        public string btnCopyText { get; set; } = "Copy to Clipboard";
        public string lblCopiedText { get; set; } = "Copied to clipboard";
        public string wndTitleText { get; set; } = "Setup Easy Keepass Browser Plugin";
    }
}
