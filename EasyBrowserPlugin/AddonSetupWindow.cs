using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EasyBrowserPlugin
{
    public partial class AddonSetupWindow : Form
    {
        private EasyBrowserPluginExt _plugin;
        public AddonSetupWindow(EasyBrowserPluginExt plugin)
        {
            _plugin = plugin;
            InitializeComponent();
            txtKey.Text = Convert.ToBase64String(_plugin.CryptoKey);
        }

        private void btnCopy_Click(object sender, EventArgs e)
        {
            try
            {
                Clipboard.SetText(txtKey.Text);
                lblCopied.Visible = true;
            } catch (Exception)
            {
                //ignore
            }
        }

        private void btnOk_Click(object sender, EventArgs e)
        {
            DialogResult = DialogResult.OK;
            Close();
        }
    }
}
