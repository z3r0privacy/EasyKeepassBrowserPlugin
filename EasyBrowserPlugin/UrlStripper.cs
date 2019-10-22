using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin
{
    class UrlStripper
    {
        private delegate string StripAction(string url);

        private string _url;
        private int stripped;
        private static readonly StripAction[] strips = new StripAction[]
            {
                s =>
                {
                    if (s.ToLower().StartsWith("http://")) s = s.Substring(7);
                    if (s.ToLower().StartsWith("https://")) s = s.Substring(8);
                    var ios = s.IndexOf('/');
                    return s.Substring(0, ios > 0 ? ios : s.Length);
                },
                s =>
                {
                    var end = s.LastIndexOf('.');
                    var start = s.Substring(0,end).LastIndexOf('.');
                    if (start >= 0)
                    {
                        return s.Substring(start+1);
                    }
                    return s;
                },
                s => s.Substring(0, s.IndexOf('.'))
            };

        public bool CanStrip => stripped < strips.Length;

        public UrlStripper(string url)
        {
            _url = url;
            stripped = 0;
        }

        public string Strip()
        {
            _url = strips[stripped](_url);
            stripped++;
            return _url;
        }

        public override string ToString()
        {
            return _url;
        }
    }
}
