using KeePass.Plugins;
using KeePassLib;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin.Shared
{
    public class Group : ViewModelBase
    {
        public PwUuid UUID { get; set; }
        public string Name { get; set; }
        public ObservableCollection<Group> SubGroups { get; set; }

        private bool _selected;
        public bool Selected
        {
            get => _selected;
            set {
                if (value != _selected)
                {
                    RaisePropertyChanging(() => Selected);
                    _selected = value;
                    RaisePropertyChanged(() => Selected);
                }
            }
        }

        public static Group CreateTree(Configuration conf, PwGroup keePassGroup)
        {
            var g = new Group
            {
                Name = keePassGroup.Name,
                UUID = keePassGroup.Uuid,
                Selected = conf.SelectedGroups.Contains(keePassGroup.Uuid)
            };
            g.SubGroups = new ObservableCollection<Group>();
            foreach (var sg in keePassGroup.Groups)
            {
                g.SubGroups.Add(CreateTree(conf, sg));
            }
            return g;
        }

        public List<PwUuid> GetSelectedUuids()
        {
            var l = new List<PwUuid>();
            if (Selected)
            {
                l.Add(UUID);
            }
            foreach(var g in SubGroups)
            {
                l.AddRange(g.GetSelectedUuids());
            }
            return l;
        }

        public bool HadSubGroupsSameState(bool v)
        {
            return SubGroups.All(g => g.Selected == v && g.HadSubGroupsSameState(v));
        }

        public void SetSubGroupsChecked(bool isChecked)
        {
            foreach (var g in SubGroups)
            {
                g.Selected = isChecked;
                g.SetSubGroupsChecked(isChecked);
            }
        }
    }
}
