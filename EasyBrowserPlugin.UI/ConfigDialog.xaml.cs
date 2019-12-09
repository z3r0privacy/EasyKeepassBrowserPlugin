using EasyBrowserPlugin.Shared;
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
            switch(vm.CurrentMode)
            {
                case Configuration.SelectionMode.All:
                    modeAll.IsChecked = true;
                    SetTreeViewEnabledState(false);
                    break;
                case Configuration.SelectionMode.AllExcept:
                    SetTreeViewEnabledState(true);
                    modeBut.IsChecked = true;
                    break;
                case Configuration.SelectionMode.Only:
                    SetTreeViewEnabledState(true);
                    modeOnly.IsChecked = true;
                    break;
                case Configuration.SelectionMode.None:
                    SetTreeViewEnabledState(false);
                    modeNone.IsChecked = true;
                    break;
            }
        }

        private void SetTreeViewEnabledState(bool isEnabled)
        {
            TreeView.IsEnabled = isEnabled;
        }

        private void mode_Click(object sender, RoutedEventArgs e)
        {
            var radio = sender as RadioButton;
            switch(radio.Name)
            {
                case "modeAll":
                    SetTreeViewEnabledState(false);
                    (DataContext as ConfigDialogViewModel).CurrentMode = Configuration.SelectionMode.All;
                    break;
                case "modeBut":
                    SetTreeViewEnabledState(true);
                    (DataContext as ConfigDialogViewModel).CurrentMode = Configuration.SelectionMode.AllExcept;
                    break;
                case "modeOnly":
                    SetTreeViewEnabledState(true);
                    (DataContext as ConfigDialogViewModel).CurrentMode = Configuration.SelectionMode.Only;
                    break;
                case "modeNone":
                    SetTreeViewEnabledState(false);
                    (DataContext as ConfigDialogViewModel).CurrentMode = Configuration.SelectionMode.None;
                    break;
            }
        }

        private void CheckedChanged(Group g, bool isChecked)
        {
            if (Keyboard.IsKeyDown(Key.LeftCtrl) || Keyboard.IsKeyDown(Key.RightCtrl))
            {
                g.SetSubGroupsChecked(isChecked);
            }
        }

        private void CheckBox_Checked(object sender, RoutedEventArgs e)
        {
            CheckedChanged((sender as CheckBox).DataContext as Group, true);            
        }

        private void CheckBox_Unchecked(object sender, RoutedEventArgs e)
        {
            CheckedChanged((sender as CheckBox).DataContext as Group, false);
        }

        private void CloseWithResult(bool dialogResult)
        {
            try
            {
                DialogResult = dialogResult;
            }
            catch (Exception) { }
            Close();
        }

        private void btnDialogOk_Click(object sender, RoutedEventArgs e)
        {
            CloseWithResult(true);
        }

        private void btnCancel_Click(object sender, RoutedEventArgs e)
        {
            CloseWithResult(false);
        }
    }
}
