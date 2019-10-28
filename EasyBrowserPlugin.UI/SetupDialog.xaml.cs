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
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace EasyBrowserPlugin.UI
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class SetupDialog : Window
    {

        public SetupDialog() : this(new SetupDialogViewModel()) { }

        public SetupDialog(SetupDialogViewModel vm)
        {
            DataContext = vm;
            InitializeComponent();
        }

        private void CloseOk()
        {
            try
            {
                DialogResult = true;
            }
            catch (Exception) { }
            Close();
        }

        private void btnDialogOk_Click(object sender, RoutedEventArgs e)
        {
            CloseOk();
        }

        private void Window_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Escape)
            {
                e.Handled = true;
                CloseOk();
            }
        }

        private void btnCopy_Click(object sender, RoutedEventArgs e)
        {
            Clipboard.SetText(((SetupDialogViewModel)DataContext).Key);
            lblCopied.Visibility = Visibility.Visible;
        }
    }
}
