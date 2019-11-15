using KeePassLib;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin.UI
{
    public class Group
    {
        public PwUuid UUID { get; set; }
        public string Name { get; set; }
        public ObservableCollection<Group> SubGroups { get; set; }
        public bool Selected { get; set; }
    }

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
        public List<Group> Groups { get; set; }
        public int CurrentMode { get; set; } = 0;

        public ConfigDialogViewModel()
        {
            Groups = new List<Group>();
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
    }
}
