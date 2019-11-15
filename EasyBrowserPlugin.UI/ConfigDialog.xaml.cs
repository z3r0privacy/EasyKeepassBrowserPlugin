using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace EasyBrowserPlugin.UI
{
    /// <summary>
    /// Interaction logic for ConfigDialog.xaml
    /// </summary>
    public partial class ConfigDialog : Window
    {
        public ConfigDialog() : this(new ConfigDialogViewModel()) { }

        public ConfigDialog(ConfigDialogViewModel vm)
        {
            InitializeComponent();
            DataContext = vm;
        }

        private void mode_Click(object sender, RoutedEventArgs e)
        {
            var radio = sender as RadioButton;
            switch(radio.Name)
            {
                case "modeAll":
                    TreeView.IsEnabled = false;
                    (DataContext as ConfigDialogViewModel).CurrentMode = 0;
                    break;
                case "modeBut":
                    TreeView.IsEnabled = true;
                    (DataContext as ConfigDialogViewModel).CurrentMode = 1;
                    break;
                case "modeOnly":
                    TreeView.IsEnabled = true;
                    (DataContext as ConfigDialogViewModel).CurrentMode = 2;
                    break;
                case "modeNone":
                    TreeView.IsEnabled = false;
                    (DataContext as ConfigDialogViewModel).CurrentMode = 3;
                    break;
            }
        }
    }
}
