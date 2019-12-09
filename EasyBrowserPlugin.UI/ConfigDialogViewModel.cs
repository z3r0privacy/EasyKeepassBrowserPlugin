using EasyBrowserPlugin.Shared;
using KeePassLib;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin.UI
{
    public class ConfigDialogViewModel
    {
        public string AllGroups { get; set; } = "All groups";
        public string AllGroupsBut { get; set; } = "All groups except selected";
        public string OnlyGroups { get; set; } = "Only selected groups";
        public string NoGroups { get; set; } = "No groups (never returns a login)";
        public string WndTitleText { get; set; } = "Configuration";
        public string BtnOkText { get; set; } = "OK";
        public string BtnCancelText { get; set; } = "Cancel";
        public string HelpText { get; set; } = "Define which groups are searched for passwords";
        public ObservableCollection<Group> Groups { get; set; }
        public Configuration.SelectionMode CurrentMode { get; set; } = 0;

        public ConfigDialogViewModel()
        {
            Groups = new ObservableCollection<Group>();
            Groups.Add(new Group
            {
                Name = "Root",
                SubGroups = new ObservableCollection<Group>()
                {
                    new Group{Name ="sub1"},
                    new Group{Name = "sub2"}
                }
            });
        }

        public ConfigDialogViewModel(Group mainGroup, Configuration.SelectionMode mode)
        {
            Groups = new ObservableCollection<Group>();
            Groups.Add(mainGroup);
            CurrentMode = mode;
        }
    }
}
